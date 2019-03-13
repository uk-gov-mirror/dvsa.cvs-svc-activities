import {AWSError} from "aws-sdk";
import {DocumentClient} from "aws-sdk/lib/dynamodb/document_client";
import * as Joi from "joi";
import uuid from "uuid";
import {IActivity} from "../models/Activity";
import {ActivitySchema} from "../models/ActivitySchema";
import {Service} from "../models/injector/ServiceDecorator";
import {HTTPResponse} from "../utils/HTTPResponse";
import {DynamoDBService} from "./DynamoDBService";

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
     */
    public async createActivity(activity: IActivity): Promise<{ id: string }> {
        // Payload validation
        const validation: Joi.ValidationResult<IActivity> = Joi.validate(activity, ActivitySchema);

        if (validation.error) {
            const error: string = validation.error.details[0].message;

            throw new HTTPResponse(400, { error });
        }

        // Check if staff already has an ongoing activity
        const ongoingCount: number = await this.dbClient.getOngoingByStaffId(activity.testerStaffId)
            .then((result: DocumentClient.QueryOutput): number => {
                return result.Count as number;
            })
            .catch((error: AWSError) => {
                throw new HTTPResponse(error.statusCode, { error: `${error.code}: ${error.message} At: ${error.hostname} - ${error.region} Request id: ${error.requestId}` });
            });

        if (ongoingCount && ongoingCount > 0) {
            throw new HTTPResponse(403, { error: `Staff ID ${activity.testerStaffId} already has an ongoing activity` });
        }

        // Assign an id
        const id: string = uuid();
        Object.assign(activity, { id });

        // Assign a startTime
        const startTime: string = new Date().toISOString();
        Object.assign(activity, { startTime });

        // The endTime will be null
        Object.assign(activity, { endTime: null });

        return this.dbClient.put(activity)
            .then(() => {
                return { id };
            })
            .catch((error: AWSError) => {
                throw new HTTPResponse(error.statusCode, { error: `${error.code}: ${error.message}
                At: ${error.hostname} - ${error.region}
                Request id: ${error.requestId}` });
            });
    }

    /**
     * Ends an activity with the given id
     * @param id - id of the activity to end
     */
    public async endActivity(id: string): Promise<void> {
        return this.dbClient.get({ id })
            .then(async (result: DocumentClient.GetItemOutput): Promise<void> => {
                // Result checks
                if (result.Item === undefined) {
                    throw new HTTPResponse(404, { error: `Activity id does not exist` });
                }

                if (result.Item.endTime !== null) {
                    throw new HTTPResponse(403, { error: `Activity already ended` });
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
                    throw error;
                }

                // Otherwise, if DynamoDB errors, we throw 500
                throw new HTTPResponse(error.statusCode, { error: `${error.code}: ${error.message} At: ${error.hostname} - ${error.region} Request id: ${error.requestId}` });
            });
    }

}
