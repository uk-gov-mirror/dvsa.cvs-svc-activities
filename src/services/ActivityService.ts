import Joi from 'joi';
import moment from 'moment';
import { v4 as uuidv4 } from 'uuid';
import { DynamoDBService } from './DynamoDBService';
import { ActivitySchema } from '@dvsa/cvs-type-definitions/types/v1/activity';
import { ActivityType } from '@dvsa/cvs-type-definitions/types/v1/enums/activityType.enum';
import { HTTPResponse } from '../utils/HTTPResponse';
import * as Constants from '../assets/enums';
import { ActivityCreated } from '../models/validators/ActivityCreated';
import { ActivityUpdated } from '../models/validators/ActivityUpdated';
import { ServiceException } from '@smithy/smithy-client';
import { GetCommandOutput } from '@aws-sdk/lib-dynamodb';

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
   * @returns Promise - The ID of the activity
   */
  public async createActivity(activity: ActivitySchema): Promise<{ id: string }> {
    // Payload validation
    const validation: Joi.ValidationResult<ActivitySchema> = ActivityCreated.validate(activity);

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
      activity.activityType === ActivityType.VISIT &&
      (await this.performVisitActValidations(activity))
    ) {
      const startTime = activity.startTime ? activity.startTime : new Date().toISOString();
      Object.assign(activity, { startTime });

      const endTime = activity.endTime ? activity.endTime : null;
      Object.assign(activity, { endTime });
    }
    // non-'visit' activity validations and object field assignments
    if (
      activity.activityType !== ActivityType.VISIT &&
      (await this.performNonVisitActValidations(activity))
    ) {
      // Assign startTime
      Object.assign(activity, { startTime: activity.startTime });
      // Assign endTime
      Object.assign(activity, { endTime: activity.endTime });
    }

    // Assign an id
    const id: string = uuidv4();
    Object.assign(activity, { id });

    const activityDay = moment(activity.startTime!).format('YYYY-MM-DD');
    Object.assign(activity, { activityDay });

    return this.dbClient
      .put(activity)
      .then(() => {
        return { id };
      })
      .catch((error: ServiceException) => {
        throw new HTTPResponse(error.$metadata.httpStatusCode || 500, {
          error: `${error.name}: ${error.message}
                Request id: ${error.$metadata.requestId}`
        });
      });
  }

  /**
   * Ends an activity with the given id, and given endTime if provided.
   * If the visit was already closed, the response will be 200 and the flag wasVisitAlreadyClosed will be set to true
   * @param id - id of the activity to end
   * @param endTime - endTime provided by auto-close function
   * @returns Promise<{wasVisitAlreadyClosed: boolean}>
   */
  public async endActivity(
    id: string,
    endTime: string
  ): Promise<{ wasVisitAlreadyClosed: boolean }> {
    try {
      const result = await this.dbClient.get({ id }) as GetCommandOutput;

      if (result.Item === undefined) {
        console.log(`Error occurred: ${Constants.HTTPRESPONSE.NOT_EXIST} with statusCode: 404`);
        throw new HTTPResponse(404, { error: Constants.HTTPRESPONSE.NOT_EXIST });
      }

      if (result.Item.endTime !== null) {
        console.log(`Visit with ID ${id} is already closed`);
        return { wasVisitAlreadyClosed: true };
      }

      const activity: ActivitySchema = result.Item as ActivitySchema;

      // use value provided by auto-close as activityEndTime, otherwise use Date.now()
      endTime
        ? (activity.endTime = new Date(endTime).toISOString())
        : (activity.endTime = new Date().toISOString());

      await this.dbClient.put(activity);

      return { wasVisitAlreadyClosed: false };
    } catch (e: any) {
      // client error so we rethrow
      if (e instanceof HTTPResponse) throw e;

      const { statusCode, code, message, hostname, region, requestId, name} = e;
      throw new HTTPResponse(statusCode, {
        error: `${code | name}: ${message} At: ${hostname} - ${region} Request id: ${requestId}`
      });
    }
  }

  /**
   * Updates an activity in the database.
   * @param activities - the payload containing the activity
   * @returns Promise - void
   */
  public async updateActivity(activities: ActivitySchema[]): Promise<void> {
    const activitiesList: any[] = [];
    for (const each of activities) {
      // Payload validation
      const validation: Joi.ValidationResult<ActivitySchema> = ActivityUpdated.validate(
        each
      );
      if (validation.error) {
        const error: string = validation.error.details[0].message;

        throw new HTTPResponse(400, { error });
      }
      await this.dbClient
        .get({ id: each.id })
        .then(async result => {
          // Result checks
          if ((result as GetCommandOutput).Item === undefined) {
            throw new HTTPResponse(404, { error: Constants.HTTPRESPONSE.NOT_EXIST });
          }

          const dbActivity: ActivitySchema = (result as GetCommandOutput).Item as ActivitySchema;

          // Assign the waitReasons
          Object.assign(dbActivity, { waitReason: each.waitReason });
          // Assign the notes
          Object.assign(dbActivity, { notes: each.notes });
          activitiesList.push(dbActivity);
        })
        .catch((error: ServiceException | HTTPResponse) => {
          // If we get HTTPResponse, we rethrow it
          if (error instanceof HTTPResponse) {
            throw error;
          }

          // Otherwise, if DynamoDB errors, we throw 500
          throw new HTTPResponse(error.$metadata.httpStatusCode || 500, {
            error: `${error.name}: ${error.message} Request id: ${error.$metadata.requestId}`
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

  protected async performVisitActValidations(activity: ActivitySchema): Promise<boolean> {
    // Visit activity should not have parent IDs
    if (activity.parentId) {
      throw new HTTPResponse(400, { error: Constants.HTTPRESPONSE.PARENT_ID_NOT_REQUIRED });
    }

    let ongoingVisits: ActivitySchema[];

    try {
      // Check if staff already has an ongoing activity if activityType is visit
      ongoingVisits = await this.dbClient.getOngoingByStaffId(activity.testerStaffId);
    } catch (error: any) {
      throw new HTTPResponse(error.statusCode || 500, {
        error: `${error.code}: ${error.message} At: ${error.hostname} - ${error.region} Request id: ${error.requestId}`
      });
    }

    if (ongoingVisits && ongoingVisits.length > 0) {
      throw new HTTPResponse(403, {
        error: `${Constants.HTTPRESPONSE.ONGOING_ACTIVITY_STAFF_ID} ${activity.testerStaffId} ${Constants.HTTPRESPONSE.ONGOING_ACTIVITY}`
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
  protected async performNonVisitActValidations(activity: ActivitySchema): Promise<boolean> {
    // Non-visit activity requires parent ID
    if (!activity.parentId) {
      throw new HTTPResponse(400, { error: Constants.HTTPRESPONSE.PARENT_ID_REQUIRED });
    }
    // Validate if parentId exists.
    await this.dbClient
      .get({ id: activity.parentId })
      .then(async result => {
        // Result checks
        if ((result as GetCommandOutput).Item === undefined) {
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
      .catch((error: ServiceException | HTTPResponse) => {
        // If we get HTTPResponse, we rethrow it
        if (error instanceof HTTPResponse) {
          throw error;
        }

        // Otherwise, if DynamoDB errors, we throw 500
        throw new HTTPResponse(error.$metadata.httpStatusCode || 500, {
          error: `${error.name}: ${error.message} Request id: ${error.$metadata.requestId}`
        });
      });
    return true;
  }
}
