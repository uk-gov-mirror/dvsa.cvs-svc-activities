import { ActivityFilters } from './../utils/Filters';
import { HTTPResponse } from '../utils/HTTPResponse';
import { DynamoDBService } from './DynamoDBService';
import { HTTPRESPONSE } from '../assets/enums';
import { IActivityParams } from '../models/Activity';
import { isValid } from 'date-fns';

export class GetActivityService {
  public readonly dbClient: DynamoDBService;

  /**
   * Constructor for the ActivityService class
   * @param dynamo
   */
  constructor(dynamo: DynamoDBService) {
    this.dbClient = dynamo;
  }

  /**
   * Get activities from Dynamodb
   * @param event
   * @returns Promise - Array of activities filtered based on the given params and sorted desc
   */
  public async getActivities(params: IActivityParams): Promise<any> {
    try {
      const { fromStartTime, toStartTime, activityType } = params;
      if (
        !(fromStartTime && toStartTime && activityType &&
        isValid(new Date(fromStartTime)) &&
        isValid(new Date(toStartTime)))
      ) {
        throw new HTTPResponse(400, HTTPRESPONSE.BAD_REQUEST);
      }
      const data = await this.dbClient.getActivities(params);
      if (!(data && data.length)) {
        throw new HTTPResponse(404, HTTPRESPONSE.NO_RESOURCES);
      }
      const ActivityFilter: ActivityFilters = new ActivityFilters();
      const result = ActivityFilter.returnOrderedActivities(data);
      return result;
    } catch (error) {
      if (error instanceof HTTPResponse) {
        console.log('error on getActivities:', error);
        throw new HTTPResponse(error.statusCode, error.body);
      }
    }
  }
}
