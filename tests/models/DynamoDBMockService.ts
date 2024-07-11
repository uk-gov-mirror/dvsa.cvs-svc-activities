import { Configuration } from '../../src/utils/Configuration';
import { IActivityParams } from '../../src/models/IActivityParams';
import { ActivitySchema } from '@dvsa/cvs-type-definitions/types/v1/activity';
import { ServiceException } from '@smithy/smithy-client';
import { BatchGetCommandOutput, BatchWriteCommandOutput, DeleteCommandOutput, GetCommandOutput, PutCommandOutput } from '@aws-sdk/lib-dynamodb';

export class DynamoDBMockService {
  private db: any;
  private readonly keys: any;

  public constructor() {
    this.db = [];
    const config: any = Configuration.getInstance().getDynamoDBConfig();
    this.keys = config.keys;
  }

  /**
   * Seeds the database with the provided items
   * @param items - an array of items
   */
  public seed(items: ActivitySchema[]): void {
    this.db = items;
  }

  /**
   * Empties the database
   */
  public empty(): void {
    this.db = [];
  }

  /**
   * Retrieves the item with the given key
   * @param key - the key of the item you wish to fetch
   * @param attributes - optionally, you can request only a set of attributes
   * @returns Promise<PromiseResult<DocumentClient.GetItemOutput, ServiceException>>
   */
  public get(
    key: any,
    attributes?: any
  ): Promise<GetCommandOutput | ServiceException> {
    return new Promise((resolve, reject) => {
      const response = {
        $response: new Response() as any
      };

      const keyAttributes: any[] = Object.entries(key);

      const itemRetrieved = this.db.find((item: any) => {
        let isMatch: boolean = true;

        for (const attribute in keyAttributes) {
          if (!(item[attribute[0]] === attribute[1])) {
            isMatch = false;
            break;
          }
        }

        return isMatch;
      });

      if (itemRetrieved) {
        response.$response.data = { Item: itemRetrieved };
        Object.assign(response, { Item: itemRetrieved });
      }

      resolve(response as unknown as GetCommandOutput);
    });
  }

  /**
   * Get ongoing by staff id
   * @param staffId
   * @returns Promise<ActivitySchema[]>
   */
  public getOngoingByStaffId(staffId: string): Promise<ActivitySchema[]> {
    return new Promise((resolve, reject) => {
      return resolve(this.db as ActivitySchema[]);
    });
  }

  /**
   * Replaces the provided item, or inserts it if it does not exist
   * @param item - item to be inserted or updated
   * @returns Promise<PromiseResult<DocumentClient.PutItemOutput, ServiceException>>
   */
  public put(item: any): Promise<PutCommandOutput | ServiceException> {
    return new Promise((resolve, reject) => {
      const response = {
        $response: new Response() as any
      };

      const itemIndex: number = this.db.findIndex((dbItem: any) => {
        let isMatch: boolean = true;

        for (const key of this.keys) {
          if (dbItem[key] !== item[key]) {
            isMatch = false;
            break;
          }
        }

        return isMatch;
      });

      if (itemIndex !== -1) {
        Object.assign(response, { Attributes: this.db[itemIndex] });
        this.db[itemIndex] = item;
      } else {
        this.db.push(item);
      }

      resolve(response as unknown as  PutCommandOutput);
    });
  }

  /**
   * Deletes the item with the given key and returns the item deleted
   * @param key - the key of the item you wish to delete
   * @returns Promise<PromiseResult<DocumentClient.DeleteItemOutput, ServiceException>>
   */
  public delete(
    key: any
  ): Promise<DeleteCommandOutput | ServiceException> {
    return new Promise((resolve, reject) => {
      const response = {
        $response: new Response()
      };

      const keyAttributes: any[] = Object.entries(key);

      const itemIndex: number = this.db.findIndex((item: any) => {
        let isMatch: boolean = true;

        for (const attribute of keyAttributes) {
          if (!(item[attribute[0]] === attribute[1])) {
            isMatch = false;
            break;
          }
        }

        return isMatch;
      });

      if (itemIndex) {
        Object.assign(response, { Attributes: this.db[itemIndex] });
        this.db.splice(itemIndex, 1);
      }

      resolve(response as unknown as DeleteCommandOutput);
    });
  }

  /**
   * Retrieves a list of items with the given keys
   * @param keys - a list of keys you wish to retrieve
   * @returns Promise<PromiseResult<BatchGetItemOutput, ServiceException>>
   */
  public batchGet(
    keys: any
  ): Promise<BatchGetCommandOutput | ServiceException> {
    return new Promise((resolve, reject) => {
      const config: any = Configuration.getInstance().getDynamoDBConfig();

      const response = {
        $response: new Response()
      };

      const keyAttributes: any[] = keys.map((key: any) => Object.entries(key));

      const items: number = this.db.filter((item: any) => {
        let isMatch: boolean = true;

        for (const keyAttribute of keyAttributes) {
          for (const attribute of keyAttribute) {
            if (!(item[attribute[0]] === attribute[1])) {
              isMatch = false;
              break;
            }
          }
        }

        return isMatch;
      });

      if (items) {
        Object.assign(response, { Responses: { [config.table]: items } });
      }

      resolve(response as unknown as BatchGetCommandOutput);
    });
  }

  /**
   * Updates or creates the items provided
   * @param items - items to add or update
   * @returns Promise<PromiseResult<DocumentClient.BatchWriteItemOutput, ServiceException>>
   */
  public batchPut(
    items: any[]
  ): Promise<BatchWriteCommandOutput | ServiceException> {
    return new Promise((resolve, reject) => {
      items.forEach(async (item: any) => {
        await this.put(item);
      });

      const response = {
        $response: new Response()
      };

      resolve(response as unknown as BatchWriteCommandOutput);
    });
  }


  /**
   * Retrieves the item with the given key
   * @param key - the key of the item you wish to fetch
   * @param attributes - optionally, you can request only a set of attributes
   * @returns Promise<PromiseResult<DocumentClient.GetItemOutput, ServiceException>>
   */
  public getActivities(params: IActivityParams): Promise<ActivitySchema[]> {
    return new Promise((resolve, reject) => {
      return resolve(this.db as ActivitySchema[]);
    });
  }
}
