import { QUERY_PARAMS } from "./../assets/enums";
import { ActivityFilters } from "./../utils/Filters";
import { HTTPResponse } from "../utils/HTTPResponse";
import { DynamoDBService } from "./DynamoDBService";
import { HTTPRESPONSE } from "../assets/enums";

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
    public async getActivities(event: any): Promise<any> {
        return this.dbClient.scan()
            .then((data: any) => {
                if (data) {
                    return this.filterActivities(data, event);
                } else {
                    throw new HTTPResponse(404, HTTPRESPONSE.NO_RESOURCES);
                }
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
     * @returns Array of activities filtered based on the given params and sorted desc
     */
    public filterActivities(response: any, event: any) {
        let filteredActivities: string[] = [];
        const ActivityFilter: ActivityFilters = new ActivityFilters();
        if (response.Count === 0) {
            throw new HTTPResponse(404, HTTPRESPONSE.NO_RESOURCES);
        } else {
            if (event.queryStringParameters) {
                if (event.queryStringParameters.fromStartTime) {
                    filteredActivities = ActivityFilter.filterActivitiesByStartTime(response.Items, event.queryStringParameters.fromStartTime, true);
                } else {
                    throw new HTTPResponse(400, HTTPRESPONSE.BAD_REQUEST);
                }
                if (event.queryStringParameters.toStartTime) {
                    filteredActivities = ActivityFilter.filterActivitiesByStartTime(filteredActivities, event.queryStringParameters.toStartTime, false);
                }
                if (event.queryStringParameters.activityType) {
                    filteredActivities = ActivityFilter.filterActivitiesByParameter(filteredActivities, event.queryStringParameters.activityType, QUERY_PARAMS.ACTIVITY_TYPE);
                }
                if (event.queryStringParameters.testStationPNumber) {
                    filteredActivities = ActivityFilter.filterActivitiesByParameter(filteredActivities, event.queryStringParameters.testStationPNumber, QUERY_PARAMS.TEST_STATION_P_NUMBER);
                }
                if (event.queryStringParameters.testerStaffId) {
                    filteredActivities = ActivityFilter.filterActivitiesByParameter(filteredActivities, event.queryStringParameters.testerStaffId, QUERY_PARAMS.TESTER_STAFF_ID);
                }
                const result = ActivityFilter.returnOrderedActivities(filteredActivities);
                if (result.length) {
                    return ActivityFilter.returnOrderedActivities(filteredActivities);
                } else {
                    throw new HTTPResponse(404, HTTPRESPONSE.NO_RESOURCES);
                }
            } else {
                throw new HTTPResponse(400, HTTPRESPONSE.BAD_REQUEST);
            }
        }
    }
}
