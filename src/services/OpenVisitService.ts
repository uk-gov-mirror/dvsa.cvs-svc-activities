import { DynamoDBService } from './DynamoDBService';
import { HTTPResponse } from '../utils/HTTPResponse';
import { ActivitySchema } from '@dvsa/cvs-type-definitions/types/v1/activity';

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
    try {
      const visits: ActivitySchema[] = await this.dbClient.getOngoingByStaffId(staffId);
      console.log(`Open visit for user ${staffId} : ${!!visits.length}`);
      return !!visits.length;
    } catch (error: any) {
      console.log('Failed to get open visits from DynamoDB: ', error);
      throw new HTTPResponse(error.statusCode || 500, { error: `Failed to get open visits` });
    }
  }
}
