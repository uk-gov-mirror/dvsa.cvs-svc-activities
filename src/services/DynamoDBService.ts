let AWS: { DynamoDB: { DocumentClient: new (arg0: any) => DocumentClient } };
if (process.env._X_AMZN_TRACE_ID) {
  // tslint:disable-next-line:no-var-requires
  AWS = require('aws-xray-sdk').captureAWS(require('aws-sdk'));
} else {
  console.log('Serverless Offline detected; skipping AWS X-Ray setup');
  // tslint:disable-next-line:no-var-requires
  AWS = require('aws-sdk');
}
import { AWSError } from 'aws-sdk'; // Only used as a type, so not wrapped by XRay
import { DocumentClient } from 'aws-sdk/lib/dynamodb/document_client'; // Only used as a type, so not wrapped by XRay
import { PromiseResult } from 'aws-sdk/lib/request'; // Only used as a type, so not wrapped by XRay
import { Configuration } from '../utils/Configuration';
import { IActivity, IActivityParams } from '../models/Activity';

export class DynamoDBService {
  private static client: DocumentClient;
  private readonly tableName: string;

  /**
   * Constructor for the DynamoDBService
   */
  public constructor() {
    const config: any = Configuration.getInstance().getDynamoDBConfig();
    this.tableName = config.table;

    if (!DynamoDBService.client) {
      DynamoDBService.client = new AWS.DynamoDB.DocumentClient(config.params);
    }
  }

  /**
   * Retrieves the item with the given key
   * @param key - the key of the item you wish to fetch
   * @param attributes - optionally, you can request only a set of attributes
   * @returns Promise<PromiseResult<DocumentClient.GetItemOutput, AWSError>>
   */
  public get(
    key: DocumentClient.Key,
    attributes?: DocumentClient.AttributeNameList
  ): Promise<PromiseResult<DocumentClient.GetItemOutput, AWSError>> {
    const query: DocumentClient.GetItemInput = {
      TableName: this.tableName,
      Key: key
    };

    if (attributes) {
      Object.assign(query, { AttributesToGet: attributes });
    }

    return DynamoDBService.client.get(query).promise();
  }

  /**
   * queries the entire table and retrieves all data based on filterParams
   * @param filterParams - parameters used for filtering data in the database
   * @returns Promise<IActivity[]> an array of activities
   */
  public async getActivities(filterParams: IActivityParams): Promise<IActivity[]> {
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
  public async getOngoingByStaffId(staffId: string): Promise<IActivity[]> {
    const keyCondition = 'testerStaffId = :staffId';
    const filterValues = {
      ':staffId': staffId,
      ':NULL': 'NULL'
    };
    const query: DocumentClient.QueryInput = {
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
   * @returns Promise<PromiseResult<DocumentClient.PutItemOutput, AWSError>>
   */
  public put(item: any): Promise<PromiseResult<DocumentClient.PutItemOutput, AWSError>> {
    const query: DocumentClient.PutItemInput = {
      TableName: this.tableName,
      Item: item,
      ReturnValues: 'ALL_OLD'
    };

    return DynamoDBService.client.put(query).promise();
  }

  /**
   * Deletes the item with the given key and returns the item deleted
   * @param key - the key of the item you wish to delete
   * @returns Promise<PromiseResult<DocumentClient.DeleteItemOutput, AWSError>>
   */
  public delete(
    key: DocumentClient.Key
  ): Promise<PromiseResult<DocumentClient.DeleteItemOutput, AWSError>> {
    const query: DocumentClient.DeleteItemInput = {
      TableName: this.tableName,
      Key: key,
      ReturnValues: 'ALL_OLD'
    };

    return DynamoDBService.client.delete(query).promise();
  }

  /**
   * Updates or creates the items provided, and returns a list of result batches
   * @param items - items to add or update
   * @returns Promise<PromiseResult<DocumentClient.BatchWriteItemOutput, AWSError>[]>
   */
  public batchPut(
    items: any[]
  ): Promise<PromiseResult<DocumentClient.BatchWriteItemOutput, AWSError>[]> {
    const itemList: DocumentClient.WriteRequests = items.slice();
    const itemBatches: DocumentClient.WriteRequests[] = [];

    while (itemList.length > 0) {
      itemBatches.push(itemList.splice(0, 25));
    }

    const promiseBatch: Promise<PromiseResult<DocumentClient.BatchWriteItemOutput, AWSError>>[] =
      itemBatches.map((batch: any[]) => {
        const query: DocumentClient.BatchWriteItemInput = {
          RequestItems: {
            [this.tableName]: batch.map((item: any) => ({ PutRequest: { Item: item } }))
          }
        };

        return DynamoDBService.client.batchWrite(query).promise();
      });

    return Promise.all(promiseBatch);
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
  private async queryAllData(params: any, allData: IActivity[] = []): Promise<IActivity[]> {
    const data: PromiseResult<DocumentClient.QueryOutput, AWSError> = await DynamoDBService.client
      .query(params)
      .promise();
    if (data.Items && data.Items.length > 0) {
      allData = [...allData, ...(data.Items as IActivity[])];
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
