import { Configuration } from '../utils/Configuration';
import { IActivityParams } from '../models/IActivityParams';
import { ActivitySchema } from '@dvsa/cvs-type-definitions/types/v1/activity';
import {
  BatchWriteCommand,
  BatchWriteCommandOutput,
  DeleteCommand,
  DeleteCommandOutput,
  DynamoDBDocumentClient,
  GetCommand,
  GetCommandOutput,
  PutCommand,
  PutCommandOutput,
  QueryCommand,
  QueryCommandInput,
  QueryCommandOutput
} from '@aws-sdk/lib-dynamodb';
import AWSXRay from 'aws-xray-sdk';
import {
  BatchWriteItemInput,
  DeleteItemInput,
  DynamoDBClient,
  GetItemInput,
  PutItemInput} from '@aws-sdk/client-dynamodb';
import { ServiceException } from '@smithy/smithy-client';

export class DynamoDBService {
  private static client: DynamoDBDocumentClient;
  private readonly tableName: string;

  /**
   * Constructor for the DynamoDBService
   */
  public constructor() {
    const config = Configuration.getInstance().getDynamoDBConfig();
    this.tableName = config.table;

    if (!DynamoDBService.client) {
      let dbClient;
      if (process.env._X_AMZN_TRACE_ID) {
        dbClient = AWSXRay.captureAWSv3Client(new DynamoDBClient(config.params));
      } else {
        console.log('Serverless Offline detected; skipping AWS X-Ray setup');
        dbClient = new DynamoDBClient(config.params);
      }
      DynamoDBService.client = DynamoDBDocumentClient.from(dbClient);
    }
  }

  /**
   * Retrieves the item with the given key
   * @param key - the key of the item you wish to fetch
   * @param attributes - optionally, you can request only a set of attributes
   * @returns Promise<GetItemOutput | ServiceException>
   */
  public async get(key: any, attributes?: any): Promise<GetCommandOutput | ServiceException> {
    const query: GetItemInput = {
      TableName: this.tableName,
      Key: key
    };

    if (attributes) {
      Object.assign(query, { AttributesToGet: attributes });
    }
    const response = await DynamoDBService.client.send(new GetCommand(query));
    return response;
  }

  /**
   * queries the entire table and retrieves all data based on filterParams
   * @param filterParams - parameters used for filtering data in the database
   * @returns Promise<ActivitySchema[]> an array of activities
   */
  public async getActivities(filterParams: IActivityParams): Promise<ActivitySchema[]> {
    const { activityType, fromStartTime, toStartTime } = filterParams;
    let keyExpressionAttribute;
    let params;

    // create keyExpressionAttribute object
    keyExpressionAttribute = {
      [':activityType']: activityType
    };

    // isOpen is used to determine which additional expressions are needed
    // fromStartTime is mandatory but not provided by auto-close so always set to 01-01-2020
    if (filterParams.isOpen) {
      Object.assign(keyExpressionAttribute, {
        [':fromStartTime']: new Date(2020, 0, 1).toISOString()
      });
      Object.assign(keyExpressionAttribute, { [':NULL']: 'NULL' });
    } else {
      Object.assign(keyExpressionAttribute, { [':fromStartTime']: fromStartTime });
      Object.assign(keyExpressionAttribute, { [':toStartTime']: toStartTime });
    }

    const expressionAttributeValues = Object.assign(
      {},
      keyExpressionAttribute,
      ...this.mapOptionalFilterValues(filterParams)
    );

    // create params
    params = {
      TableName: this.tableName,
      IndexName: 'ActivityTypeIndex',
      KeyConditionExpression: 'activityType = :activityType AND startTime >= :fromStartTime',
      ExpressionAttributeValues: {
        ...expressionAttributeValues
      }
    };

    // isOpen is used to determine which additional conditions are needed
    // auto-close only retrieves activities with no endTime
    if (filterParams.isOpen) {
      Object.assign(params, { FilterExpression: 'attribute_type(endTime, :NULL)' });
    } else {
      Object.assign(params, {
        KeyConditionExpression:
          'activityType = :activityType AND startTime BETWEEN :fromStartTime AND :toStartTime'
      });

      const filterExpression = this.getOptionalFilters('', filterParams);

      if (filterExpression) {
        (params as any).FilterExpression = filterExpression;
      }
    }

    console.log('params for getActivity', params);
    try {
      return await this.queryAllData(params);
    } catch (err) {
      console.error('error on getActivities', err);
      throw err;
    }
  }

  /**
   * Retrieves the ongoing activity for a given staffId
   * @param staffId - staff id for which to retrieve activity
   * @returns Promise<Activity[]>
   */
  public async getOngoingByStaffId(staffId: string): Promise<ActivitySchema[]> {
    const keyCondition = 'testerStaffId = :staffId';
    const filterValues = {
      ':staffId': staffId,
      ':NULL': 'NULL'
    };
    const query: QueryCommandInput = {
      TableName: this.tableName,
      IndexName: 'StaffIndex',
      KeyConditionExpression: keyCondition,
      FilterExpression: 'attribute_type(endTime, :NULL)',
      ExpressionAttributeValues: filterValues
    };

    console.log('params for getOngoingByStaffId', query);
    try {
      return await this.queryAllData(query);
    } catch (err) {
      console.error('error on getOngoingByStaffId', err);
      throw err;
    }
  }

  /**
   * Replaces the provided item, or inserts it if it does not exist
   * @param item - item to be inserted or updated
   * @returns Promise<PutItemOutput | ServiceException>
   */
  public async put(item: any): Promise<PutCommandOutput | ServiceException> {
    const query: PutItemInput = {
      TableName: this.tableName,
      Item: item,
      ReturnValues: 'ALL_OLD'
    };

    const response = await DynamoDBService.client.send(new PutCommand(query));
    return response;
  }

  /**
   * Deletes the item with the given key and returns the item deleted
   * @param key - the key of the item you wish to delete
   * @returns Promise<PromiseResult<DocumentClient.DeleteItemOutput, ServiceException>>
   */
  public async delete(key: any): Promise<DeleteCommandOutput | ServiceException> {
    const query: DeleteItemInput = {
      TableName: this.tableName,
      Key: key,
      ReturnValues: 'ALL_OLD'
    };

    const response = await DynamoDBService.client.send(new DeleteCommand(query));
    return response;
  }

  /**
   * Updates or creates the items provided, and returns a list of result batches
   * @param items - items to add or update
   * @returns Promise<PromiseResult<DocumentClient.BatchWriteItemOutput, ServiceException>[]>
   */
  public async batchPut(items: any[]): Promise<any> {
    const itemList = items.slice();
    const itemBatches = [];

    while (itemList.length > 0) {
      itemBatches.push(itemList.splice(0, 25));
    }

    const promiseBatch: Promise<BatchWriteCommandOutput | ServiceException>[] = itemBatches.map(
      async (batch: any[]) => {
        const query: BatchWriteItemInput = {
          RequestItems: {
            [this.tableName]: batch.map((item: any) => ({ PutRequest: { Item: item } }))
          }
        };

        return await DynamoDBService.client.send(new BatchWriteCommand(query));
      }
    );

    return await Promise.all(promiseBatch);
  }

  /**
   * To map optional filters to filterExpression
   * @param filterExpress The filterExpression which needs to be updated
   * @param filters all optional filters
   * @returns returns the updated filterExpression
   */
  private getOptionalFilters(filterExpression: string, filters: any): string {
    const { testStationPNumber, testerStaffId } = filters;
    const appendAnd = (fullExpression: string, expression: string) =>
      fullExpression === ''
        ? fullExpression.concat(expression)
        : fullExpression.concat(' AND ', expression);
    filterExpression = testStationPNumber
      ? appendAnd(filterExpression, 'testStationPNumber = :testStationPNumber')
      : filterExpression;
    filterExpression = testerStaffId
      ? appendAnd(filterExpression, 'testerStaffId = :testerStaffId')
      : filterExpression;
    return filterExpression;
  }

  /**
   * Returns all data in the database recursively using paginated query
   * @param params parameters to filter data from the database
   * @param allData the result set which is recursively populated.
   * @returns array of activities
   */
  private async queryAllData(params: any, allData: ActivitySchema[] = []): Promise<ActivitySchema[]> {
    const data: QueryCommandOutput | ServiceException = await DynamoDBService.client.send(
      new QueryCommand(params)
    );

    if (data.Items && data.Items.length > 0) {
      allData = [...allData, ...(data.Items as ActivitySchema[])];
    }
    if (data.LastEvaluatedKey) {
      params.ExclusiveStartKey = data.LastEvaluatedKey;
      return this.queryAllData(params, allData);
    } else {
      return allData;
    }
  }

  /**
   * map filter values to dynamo variables
   * @param filters filters passed in with the query string
   * @returns returns array of key value pairs
   */
  private mapOptionalFilterValues(filters: IActivityParams) {
    const filterValues = [];
    const { testStationPNumber, testerStaffId } = filters;

    if (testStationPNumber) {
      filterValues.push({ [':testStationPNumber']: testStationPNumber });
    }
    if (testerStaffId) {
      filterValues.push({ [':testerStaffId']: testerStaffId });
    }
    return filterValues;
  }
}
