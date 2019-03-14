import { describe } from "mocha";
import { expect } from "chai";
import { Injector } from "../../src/models/injector/Injector";
import { ActivityService } from "../../src/services/ActivityService";
import { DynamoDBMockService } from "../models/DynamoDBMockService";
import { HTTPResponse } from "../../src/utils/HTTPResponse";

describe("endActivity", () => {
    const activityService: ActivityService = Injector.resolve<ActivityService>(ActivityService, [DynamoDBMockService]);
    let activityId: string = "5e4bd304-446e-4678-8289-d34fca9256e9"; // Non-existing ID

    context("when the activity does not exist", () => {
        it("should return an error", () => {
            return activityService.endActivity(activityId)
            .then(() => {
                // The creation should not succeed
                expect.fail();
            })
            .catch((error: HTTPResponse) => {
                const body: any = JSON.parse(error.body);
                expect(body.error).to.equal(`Activity id does not exist`);
            });
        });
    });

    context("when the activity has successfully ended", () => {
        it("should return void", async () => {
            // Create the activity
            const payload: any = {
                activityType: "visit",
                testStationName: "Rowe, Wunsch and Wisoky",
                testStationPNumber: "87-1369569",
                testStationEmail: "teststationname@dvsa.gov.uk",
                testStationType: "gvts",
                testerName: "Gica",
                testerStaffId: "132"
            };

            activityId = (await activityService.createActivity(payload)).id;

            // If the call does not throw errors, it is successful
            return activityService.endActivity(activityId)
                .catch((error: HTTPResponse) => {
                    expect.fail();
                });
        });
    });

    context("when the activity has already ended", () => {
        it("should return an error", async () => {
            return activityService.endActivity(activityId)
                .then(() => {
                    // The creation should not succeed
                    expect.fail();
                })
                .catch((error: HTTPResponse) => {
                    const body: any = JSON.parse(error.body);
                    expect(body.error).to.equal(`Activity already ended`);
                });
        });
    });
});
