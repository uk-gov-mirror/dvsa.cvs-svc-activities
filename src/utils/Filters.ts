import { isAfter, isBefore, isEqual } from "date-fns";
import { HTTPResponse } from "../utils/HTTPResponse";

export class ActivityFilters {
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
            const date = new Date(date1.startTime).toISOString();
            const dateToCompare = new Date(date2.startTime).toISOString();
            if (date > dateToCompare) { return -1; }
            if (date < dateToCompare) { return 1; }
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
