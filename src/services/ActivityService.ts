import * as Joi from 'joi';
import moment from 'moment';
import uuid from 'uuid';
import { AWSError } from 'aws-sdk'; // Only used as a type, so not wrapped by XRay
import { DocumentClient } from 'aws-sdk/lib/dynamodb/document_client'; // Only used as a type, so not wrapped by XRay

import { DynamoDBService } from './DynamoDBService';
import { IActivity } from '../models/Activity';
import { ActivitySchema } from '../models/ActivitySchema';
import { ActivityUpdateSchema } from '../models/ActivityUpdateSchema';
import { HTTPResponse } from '../utils/HTTPResponse';
import * as Constants from '../assets/enums';

export class ActivityService {
  public readonly dbClient: DynamoDBService;

  /**
   * Constructor for the ActivityService class
   * @param dynamo
   */
  constructor(dynamo: DynamoDBService) {
    this.dbClient = dynamo;
  }

  /**
   * Creates a new activity in the database.
   * The startTime of this activity will be now.
   * @param activity - the payload containing the activity
   * @returns Promise - The ID of the activitiy
   */
  public async createActivity(activity: IActivity): Promise<{ id: string }> {
    // Payload validation
    const validation: Joi.ValidationResult<IActivity> = Joi.validate(activity, ActivitySchema);

    if (validation.error) {
      const error: string = validation.error.details[0].message;

      throw new HTTPResponse(400, { error });
    }

    // Check if parentId is not null if activityType is 'wait' or 'accountable time' and is null when activityType is 'visit'
    if (activity.activityType === 'visit' && activity.parentId) {
      throw new HTTPResponse(400, { error: Constants.HTTPRESPONSE.PARENT_ID_NOT_REQUIRED });
    }
    if (activity.activityType !== 'visit' && !activity.parentId) {
      throw new HTTPResponse(400, { error: Constants.HTTPRESPONSE.PARENT_ID_REQUIRED });
    }

    // 'visit' activity validations and object field assignments
    if (
      activity.activityType === Constants.ActivityType.VISIT &&
      (await this.performVisitActValidations(activity))
    ) {
      const startTime = activity.startTime ? activity.startTime : new Date().toISOString();
      Object.assign(activity, { startTime });

      const endTime = activity.endTime ? activity.endTime : null;
      Object.assign(activity, { endTime });
    }
    // non-'visit' activity validations and object field assignments
    if (
      activity.activityType !== Constants.ActivityType.VISIT &&
      (await this.performNonVisitActValidations(activity))
    ) {
      // Assign startTime
      Object.assign(activity, { startTime: activity.startTime });
      // Assign endTime
      Object.assign(activity, { endTime: activity.endTime });
    }

    // Assign an id
    const id: string = uuid();
    Object.assign(activity, { id });

    const activityDay = moment(activity.startTime!).format('YYYY-MM-DD');
    Object.assign(activity, { activityDay });

    return this.dbClient
      .put(activity)
      .then(() => {
        return { id };
      })
      .catch((error: AWSError) => {
        throw new HTTPResponse(error.statusCode || 500, {
          error: `${error.code}: ${error.message}
                At: ${error.hostname} - ${error.region}
                Request id: ${error.requestId}`
        });
      });
  }

  /**
   * Ends an activity with the given id
   * if the visit was already closed, the response will be 200 and the flag wasVisitAlreadyClosed will be set to true
   * @param id - id of the activity to end
   * @returns Promise<{wasVisitAlreadyClosed: boolean}>
   */
  public async endActivity(id: string): Promise<{ wasVisitAlreadyClosed: boolean }> {
    try {
      const result: DocumentClient.GetItemOutput = await this.dbClient.get({ id });

      if (result.Item === undefined) {
        console.log(`Error occurred: ${Constants.HTTPRESPONSE.NOT_EXIST} with statusCode: 404`);
        throw new HTTPResponse(404, { error: Constants.HTTPRESPONSE.NOT_EXIST });
      }

      if (result.Item.endTime !== null) {
        console.log(`Visit with ID ${id} is already closed`);
        return { wasVisitAlreadyClosed: true };
      }

      const activity: IActivity = result.Item as IActivity;
      activity.endTime = new Date().toISOString();
      await this.dbClient.put(activity);

      return { wasVisitAlreadyClosed: false };
    } catch (e) {
      // client error so we rethrow
      if (e instanceof HTTPResponse) throw e;

      const { statusCode, code, message, hostname, region, requestId } = e;
      throw new HTTPResponse(statusCode, {
        error: `${code}: ${message} At: ${hostname} - ${region} Request id: ${requestId}`
      });
    }
  }

  /**
   * Updates an activity in the database.
   * @param activity - the payload containing the activity
   * @returns Promise - void
   */
  public async updateActivity(activities: IActivity[]): Promise<void> {
    const activitiesList: any[] = [];
    for (const each of activities) {
      // Payload validation
      const validation: Joi.ValidationResult<IActivity> = Joi.validate(
        each,
        ActivityUpdateSchema
      );
      if (validation.error) {
        const error: string = validation.error.details[0].message;

        throw new HTTPResponse(400, { error });
      }
      await this.dbClient
        .get({ id: each.id })
        .then(async (result: DocumentClient.GetItemOutput): Promise<void> => {
          // Result checks
          if (result.Item === undefined) {
            throw new HTTPResponse(404, { error: Constants.HTTPRESPONSE.NOT_EXIST });
          }

          const dbActivity: IActivity = result.Item as IActivity;

          // Assign the waitReasons
          Object.assign(dbActivity, { waitReason: each.waitReason });
          // Assign the notes
          Object.assign(dbActivity, { notes: each.notes });
          activitiesList.push(dbActivity);
        })
        .catch((error: AWSError | HTTPResponse) => {
          // If we get HTTPResponse, we rethrow it
          if (error instanceof HTTPResponse) {
            throw error;
          }

          // Otherwise, if DynamoDB errors, we throw 500
          throw new HTTPResponse(error.statusCode || 500, {
            error: `${error.code}: ${error.message} At: ${error.hostname} - ${error.region} Request id: ${error.requestId}`
          });
        });
    }
    // Batch update of activities
    await this.dbClient.batchPut(activitiesList);
  }

  /**
   * Validates the 'visit' activity fields and throws error if not invalid
   * @param activity - the payload containing the activity
   * @returns boolean
   */

  protected async performVisitActValidations(activity: IActivity): Promise<boolean> {
    // Visit activity should not have parent IDs
    if (activity.parentId) {
      throw new HTTPResponse(400, { error: Constants.HTTPRESPONSE.PARENT_ID_NOT_REQUIRED });
    }

    // Check if staff already has an ongoing activity if activityType is visit
    const ongoingCount: number = await this.dbClient
      .getOngoingByStaffId(activity.testerStaffId)
      .then((result: DocumentClient.QueryOutput): number => {
        return result.Count as number;
      })
      .catch((error: AWSError) => {
        throw new HTTPResponse(error.statusCode || 500, {
          error: `${error.code}: ${error.message} At: ${error.hostname} - ${error.region} Request id: ${error.requestId}`
        });
      });

    if (ongoingCount && ongoingCount > 0) {
      throw new HTTPResponse(403, {
        error: `${Constants.HTTPRESPONSE.ONGOING_ACTIVITY_STAFF_ID} ${activity.testerStaffId} ${Constants.HTTPRESPONSE.ONGING_ACTIVITY}`
      });
    }
    // If no errors, then return true.
    return true;
  }

  /**
   * Validates the non-'visit' activity fields and throws error if not invalid
   * @param activity - the payload containing the activity
   * @returns boolean
   */
  protected async performNonVisitActValidations(activity: IActivity): Promise<boolean> {
    // Non-visit activity requires parent ID
    if (!activity.parentId) {
      throw new HTTPResponse(400, { error: Constants.HTTPRESPONSE.PARENT_ID_REQUIRED });
    }
    // Validate if parentId exists.
    await this.dbClient
      .get({ id: activity.parentId })
      .then(async (result: DocumentClient.GetItemOutput): Promise<void> => {
        // Result checks
        if (result.Item === undefined) {
          throw new HTTPResponse(400, { error: Constants.HTTPRESPONSE.PARENT_ID_NOT_EXIST });
        }
        // Validate if startTime is provided in request
        if (!activity.startTime) {
          throw new HTTPResponse(400, { error: Constants.HTTPRESPONSE.START_TIME_EMPTY });
        }
        // Validate if endTime is provided in request
        if (!activity.endTime) {
          throw new HTTPResponse(400, { error: Constants.HTTPRESPONSE.END_TIME_EMPTY });
        }
      })
      .catch((error: AWSError | HTTPResponse) => {
        // If we get HTTPResponse, we rethrow it
        if (error instanceof HTTPResponse) {
          throw error;
        }

        // Otherwise, if DynamoDB errors, we throw 500
        throw new HTTPResponse(error.statusCode || 500, {
          error: `${error.code}: ${error.message} At: ${error.hostname} - ${error.region} Request id: ${error.requestId}`
        });
      });
    return true;
  }
}
