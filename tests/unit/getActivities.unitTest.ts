import { GetActivityService } from "../../src/services/GetActivitiesService";
import { DynamoDBMockService } from "../models/DynamoDBMockService";
import { HTTPResponse } from "../../src/utils/HTTPResponse";
import * as jsonData from "../resources/activities.json";

describe("getActivities", () => {
    // @ts-ignore
    const getActivityService: GetActivityService = new GetActivityService(new DynamoDBMockService());
    context("when no data is returned from database", () => {
        it("should throw error", () => {
            const event = {
                queryStringParameters: {
                    fromStartTime: "2020-02-12"
                }
            };
            expect.assertions(2);

            return getActivityService.getActivities(event)
              .catch((error: HTTPResponse) => {
                const body: any = JSON.parse(error.body);
                expect(error.statusCode).toEqual(404);
                expect(JSON.parse(body)).toEqual("No resources match the search criteria");
            });
        });
    });
    context("when the fromStarTime is valid", () => {
        it("should return array of activities", () => {
            const event = {
                queryStringParameters: {
                    fromStartTime: "2014-02-12"
                }
            };
            const dataMock: any = jsonData;
            dataMock.Items = dataMock.default;
            expect(getActivityService. filterActivities(dataMock, event)).not.toHaveLength(0);
        });
        describe("and the toStartTime is valid", () => {
            it("should return array of activities", () => {
                const event = {
                    queryStringParameters: {
                        fromStartTime: "2014-02-12",
                        toStartTime: "2019-02-12"
                    }
                };
                const dataMock: any = jsonData;
                dataMock.Items = dataMock.default;
                expect(getActivityService.filterActivities(dataMock, event)).not.toHaveLength(0);
            });
        });
        describe("and the activityType is valid", () => {
            it("should return array of activities", () => {
                const event = {
                    queryStringParameters: {
                        fromStartTime: "2014-02-12",
                        toStartTime: "2019-02-12",
                        activityType: "visit"
                    }
                };
                const dataMock: any = jsonData;
                dataMock.Items = dataMock.default;
                expect(getActivityService.filterActivities(dataMock, event)).not.toHaveLength(0);
            });
        });
        describe("and the testStationPNumber is valid", () => {
            it("should return array of activities", () => {
                const event = {
                    queryStringParameters: {
                        fromStartTime: "2014-02-12",
                        toStartTime: "2019-02-12",
                        activityType: "visit",
                        testStationPNumber: "87-1369561"
                    }
                };
                const dataMock: any = jsonData;
                dataMock.Items = dataMock.default;
                expect(getActivityService.filterActivities(dataMock, event)).not.toHaveLength(0);
            });
        });
        describe("and the testerStaffId is valid", () => {
            it("should return array of activities", () => {
                const event = {
                    queryStringParameters: {
                        fromStartTime: "2014-02-12",
                        toStartTime: "2019-02-12",
                        activityType: "visit",
                        testStationPNumber: "87-1369561",
                        testerStaffId: "132"
                    }
                };
                const dataMock: any = jsonData;
                dataMock.Items = dataMock.default;
                expect(getActivityService.filterActivities(dataMock, event)).not.toHaveLength(0);
            });
        });
    });
});
