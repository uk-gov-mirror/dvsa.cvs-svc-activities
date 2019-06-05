import { AWSError } from "aws-sdk"; // Only used as a type, so not wrapped by XRay
import { DocumentClient } from "aws-sdk/lib/dynamodb/document_client"; // Only used as a type, so not wrapped by XRay
import * as Joi from "joi";
import uuid from "uuid";
import { IActivity } from "../models/Activity";
import { ActivitySchema } from "../models/ActivitySchema";
import { ActivityUpdateSchema } from "../models/ActivityUpdateSchema";
import { Service } from "../models/injector/ServiceDecorator";
import { HTTPResponse } from "../utils/HTTPResponse";
import { DynamoDBService } from "./DynamoDBService";
import {ActivityType, HTTPRESPONSE} from "../assets/enums";


@Service()
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
        if (activity.activityType === "visit" && activity.parentId) {
            throw new HTTPResponse(400, {error: HTTPRESPONSE.PARENT_ID_NOT_REQUIRED});
        }
        if (activity.activityType !== "visit" && !activity.parentId) {
            throw new HTTPResponse(400, {error : HTTPRESPONSE.PARENT_ID_REQUIRED});
        }

        // 'visit' activity validations and object field assignments
        if (activity.activityType === ActivityType.VISIT && await this.performVisitActValidations(activity)) {
            const startTime: string = new Date().toISOString();
            Object.assign(activity, {startTime});
            // The endTime will be null
            Object.assign(activity, {endTime: null});
        }
        // non-'visit' activity validations and object field assignments
        if (activity.activityType !== ActivityType.VISIT && await this.performNonVisitActValidations(activity)) {
            // Assign startTime as currentTS
            const startTime: string = new Date().toISOString();
            Object.assign(activity, {startTime});
            // The endTime will be null
            Object.assign(activity, { endTime: null });
        }

        // Assign an id
        const id: string = uuid();
        Object.assign(activity, { id });



        return this.dbClient.put(activity)
            .then(() => {
                return { id };
            })
            .catch((error: AWSError) => {
                throw new HTTPResponse(error.statusCode, {
                    error: `${error.code}: ${error.message}
                At: ${error.hostname} - ${error.region}
                Request id: ${error.requestId}`
                });
            });
    }

    /**
     * Ends an activity with the given id
     * @param id - id of the activity to end
     * @returns Promise void
     */
    public async endActivity(id: string): Promise<void> {
        return this.dbClient.get({ id })
            .then(async (result: DocumentClient.GetItemOutput): Promise<void> => {
                // Result checks
                if (result.Item === undefined) {
                    throw new HTTPResponse(404, { error: HTTPRESPONSE.NOT_EXIST });
                }

                if (result.Item.endTime !== null) {
                    throw new HTTPResponse(403, { error: HTTPRESPONSE.ALREADY_ENDED });
                }

                const activity: IActivity = result.Item as IActivity;

                // Assign the endTime
                const endTime: string = new Date().toISOString();
                Object.assign(activity, { endTime });

                await this.dbClient.put(activity);
            })
            .catch((error: AWSError | HTTPResponse) => {
                // If we get HTTPResponse, we rethrow it
                if (error instanceof HTTPResponse) {
                    console.error(`Error occurred: ${error.body}`);
                    throw error;
                }

                // Otherwise, if DynamoDB errors, we throw 500
                throw new HTTPResponse(error.statusCode, { error: `${error.code}: ${error.message} At: ${error.hostname} - ${error.region} Request id: ${error.requestId}` });
            });
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
            const validation: Joi.ValidationResult<IActivity> = Joi.validate(each, ActivityUpdateSchema);
            if (validation.error) {
                const error: string = validation.error.details[0].message;

                throw new HTTPResponse(400, {error});
            }
            await this.dbClient.get({id: each.id})
                .then(async (result: DocumentClient.GetItemOutput): Promise<void> => {
                    // Result checks
                    if (result.Item === undefined) {
                        throw new HTTPResponse(404, {error: HTTPRESPONSE.NOT_EXIST});
                    }

                    const dbActivity: IActivity = result.Item as IActivity;

                    // Assign the waitReasons
                    Object.assign(dbActivity, {waitReason: each.waitReason});
                    // Assign the notes
                    Object.assign(dbActivity, {notes: each.notes});
                    activitiesList.push(dbActivity);
                })
                .catch((error: AWSError | HTTPResponse) => {

                    // If we get HTTPResponse, we rethrow it
                    if (error instanceof HTTPResponse) {
                        throw error;
                    }

                    // Otherwise, if DynamoDB errors, we throw 500
                    throw new HTTPResponse(error.statusCode, {error: `${error.code}: ${error.message} At: ${error.hostname} - ${error.region} Request id: ${error.requestId}`});
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
            throw new HTTPResponse(400, {error: HTTPRESPONSE.PARENT_ID_NOT_REQUIRED});
        }

        // Check if staff already has an ongoing activity if activityType is visit
        const ongoingCount: number = await this.dbClient.getOngoingByStaffId(activity.testerStaffId)
            .then((result: DocumentClient.QueryOutput): number => {
                return result.Count as number;
            })
            .catch((error: AWSError) => {
                throw new HTTPResponse(error.statusCode, { error: `${error.code}: ${error.message} At: ${error.hostname} - ${error.region} Request id: ${error.requestId}` });
            });

        if (ongoingCount && ongoingCount > 0) {
            throw new HTTPResponse(403, { error: HTTPRESPONSE.ONGOING_ACTIVITY_STAFF_ID + " " + activity.testerStaffId + " " + HTTPRESPONSE.ONGING_ACTIVITY});
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
            throw new HTTPResponse(400, {error : HTTPRESPONSE.PARENT_ID_REQUIRED});
        }
        // Validate if parentId exists.
        await this.dbClient.get({id: activity.parentId})
            .then(async (result: DocumentClient.GetItemOutput): Promise<void> => {
                // Result checks
                if (result.Item === undefined) {
                    throw new HTTPResponse(400, {error: HTTPRESPONSE.PARENT_ID_NOT_EXIST});
                }
                // Validate if startTime is provided in request
                if (!activity.startTime) {
                    throw new HTTPResponse(400, {error : HTTPRESPONSE.START_TIME_EMPTY});
                }
                // Validate if endTime is provided in request
                if (!activity.endTime) {
                    throw new HTTPResponse(400, {error : HTTPRESPONSE.END_TIME_EMPTY});
                }
            })
            .catch((error: AWSError | HTTPResponse) => {

                // If we get HTTPResponse, we rethrow it
                if (error instanceof HTTPResponse) {
                    throw error;
                }

                // Otherwise, if DynamoDB errors, we throw 500
                throw new HTTPResponse(error.statusCode, {error: `${error.code}: ${error.message} At: ${error.hostname} - ${error.region} Request id: ${error.requestId}`});

            });
        return true;
    }

}
