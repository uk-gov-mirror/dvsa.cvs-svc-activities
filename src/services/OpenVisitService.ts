import { DynamoDBService } from './DynamoDBService';
import { DocumentClient } from 'aws-sdk/lib/dynamodb/document_client';
import { AWSError } from 'aws-sdk';
import { HTTPResponse } from '../utils/HTTPResponse';

export default class OpenVisitService {
  public readonly dbClient: DynamoDBService;

  /**
   * Constructor for the ActivityService class
   * @param dynamo
   */
  constructor(dynamo: DynamoDBService) {
    this.dbClient = dynamo;
  }

  /**
   * Does the staffId have a currently open visit?
   * @param staffId
   */
  public async checkOpenVisit(staffId: string): Promise<boolean> {
    const visits: number = await this.dbClient
      .getOngoingByStaffId(staffId)
      .then((result: DocumentClient.QueryOutput): number => {
        return result.Count as number;
      })
      .catch((error: AWSError) => {
        console.log('Failed to get open visits from DynamoDB: ', error);
        throw new HTTPResponse(error.statusCode || 500, { error: `Failed to get open visits` });
      });
    return visits > 0;
  }
}
