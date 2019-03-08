import { AWSError, HttpResponse } from "aws-sdk";
import { DocumentClient } from "aws-sdk/lib/dynamodb/document_client";
import * as Joi from "joi";
import uuid from "uuid";
import { IActivity } from "../models/Activity";
import { ActivitySchema } from "../models/ActivitySchema";
import { Service } from "../models/injector/ServiceDecorator";
import { HTTPResponse } from "../utils/HTTPResponse";
import { DynamoDBService } from "./DynamoDBService";
import { isAfter, isBefore, isEqual } from "date-fns";

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

    /**
     * Get activities from Dynamodb
     */
    public getActivity(event: any): Promise<any> {
        return this.dbClient.scan()
            .then((data: any) => {
                return this.filterActivities(data, event);
            })
            .catch((error) => {
                if (error instanceof HTTPResponse) {
                    throw new HTTPResponse(error.statusCode, error.body);
                }
            });
    }

    /**
     * Filter activities by received parameters
     * @param response Data received from Dynamodb
     * @param event Event
     */
    public filterActivities(response: any, event: any) {
        let filteredActivities: string[] = [];
        if (response.Count === 0) {
            throw new HTTPResponse(404, "No resources match the search criteria");
        } else {
            if (event.queryStringParameters) {
                if (event.queryStringParameters.fromStartTime) {
                    filteredActivities = this.filterActivitiesByStartTime(response.Items, event.queryStringParameters.fromStartTime, true);
                } else {
                    throw new HTTPResponse(400, "Bad request");
                }
                if (event.queryStringParameters.toStartTime) {
                    filteredActivities = this.filterActivitiesByStartTime(filteredActivities, event.queryStringParameters.toStartTime, false);
                }
                if (event.queryStringParameters.activityType) {
                    filteredActivities = this.filterActivitiesByParameter(filteredActivities, event.queryStringParameters.activityType, "activityType");
                }
                if (event.queryStringParameters.testStationPNumber) {
                    filteredActivities = this.filterActivitiesByParameter(filteredActivities, event.queryStringParameters.testStationPNumber, "testStationPNumber");
                }
                if (event.queryStringParameters.testerStaffId) {
                    filteredActivities = this.filterActivitiesByParameter(filteredActivities, event.queryStringParameters.testerStaffId, "testerStaffId");
                }
                return this.returnOrderedActivities(filteredActivities);
            } else {
                throw new HTTPResponse(400, "Bad request");
            }
        }
    }

    /**
     * Filter activities by Start Time
     * @param activities Array of activities
     * @param params Query parameters
     * @param option True = ifAfter | False = ifBefore
     */
    private filterActivitiesByStartTime(activities: string[], startTime: string, option: boolean): string[] {
        const activityArray: string[] = [];
        activities.forEach((element: any) => {
            switch (option) {
                case true:
                    if (isAfter(element.startTime, startTime) || isEqual(element.startTime, startTime)) {
                        activityArray.push(element);
                    }
                    break;
                case false:
                    if (isBefore(element.startTime, startTime) || isEqual(element.startTime, startTime)) {
                        activityArray.push(element);
                    }
            }
        });
        if (activityArray.length) {
            return activityArray;
        } else {
            throw new HTTPResponse(404, "No resources match the search criteria");
        }
    }

    /**
     * Filter activities by parameter
     * @param activities Array of activities
     * @param value Value of the @param field
     * @param field activityType | testStationPNumber | testerStaffId
     */
    private filterActivitiesByParameter(activities: string[], value: string, field: string) {
        const filteredArrayOfActivities = activities.filter((element: any) => {
            return element[field] === value;
        });
        if (filteredArrayOfActivities.length) {
            return filteredArrayOfActivities;
        } else {
            throw new HTTPResponse(404, "No resources match the search criteria");
        }
    }

    /**
     * Order Activities desc by Start Time
     * @param activities Array of activities
     */
    private returnOrderedActivities(activities: string[]): string[] {
        const sortDateDesc = (date1: any, date2: any) => {
            if (new Date(date1.startTime) > new Date(date2.startTime)) { return -1; }
            if (new Date(date1.startTime) < new Date(date2.startTime)) { return 1; }
            return 0;
        };
        activities.sort(sortDateDesc);
        if (activities.length <= 10) {
            return activities;
        } else {
            activities.length = 10;
            return activities;
        }
    }
}
