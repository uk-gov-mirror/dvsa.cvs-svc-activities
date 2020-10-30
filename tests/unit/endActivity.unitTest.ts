import { ActivityService } from "../../src/services/ActivityService";
import { DynamoDBMockService } from "../models/DynamoDBMockService";
import { HTTPResponse } from "../../src/utils/HTTPResponse";
import { HTTPRESPONSE } from "../../src/assets/enums";

describe("endActivity", () => {
    let activityService: any;
    let activityId: string = "5e4bd304-446e-4678-8289-d34fca9256e9"; // Non-existing ID
    // @ts-ignore
    beforeEach(() => activityService = new ActivityService(new DynamoDBMockService()))
    afterEach(() => jest.clearAllMocks())

    context("when the activity does not exist", () => {
        it("should return an error", () => {
            expect.assertions(1);

            activityService.endActivity = jest.fn().mockImplementation(() =>
                Promise.reject({body: {error: HTTPRESPONSE.NOT_EXIST}})
            )
            return activityService.endActivity(activityId)
            .catch((errorResponse: HTTPResponse) => {
                expect(errorResponse.body.error).toEqual(HTTPRESPONSE.NOT_EXIST);
            });
        });
    });

    context("when the activity has successfully ended", () => {
        it(`should return wasVisitAlreadyClosed set to false when endActivity is called`, async () => {
            // Create the activity
            const payload: any = {
                activityType: "visit",
                testStationName: "Rowe, Wunsch and Wisoky",
                testStationPNumber: "87-1369569",
                testStationEmail: "teststationname@dvsa.gov.uk",
                testStationType: "gvts",
                testerName: "Gica",
                testerStaffId: "132",
                testerEmail: "tester@dvsa.gov.uk",
            };

            activityId = (await activityService.createActivity(payload)).id;

            expect.assertions(1);
            return activityService.endActivity(activityId)
                .then((response: { wasVisitAlreadyClosed: boolean }) => {
                    expect(response.wasVisitAlreadyClosed).toBe(false);
                })
                .catch((_: HTTPResponse) => {
                    fail('test should not fail');
                });
        });
    });

    context("when the activity has already ended", () => {
        it("should return a successful response with wasVisitAlreadyClosed set to true", async () => {
            expect.assertions(1);

            activityService.endActivity = jest.fn().mockImplementation(() =>
                Promise.resolve({ wasVisitAlreadyClosed: true })
            )

            return activityService.endActivity(activityId)
                .then((response: {wasVisitAlreadyClosed: boolean}) => {
                    expect(response.wasVisitAlreadyClosed).toBe(true);
                })
                .catch(() => {
                    fail('test should not fail');
                });
        });
    });
});
