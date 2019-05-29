import { describe } from "mocha";
import { expect } from "chai";
import { Injector } from "../../src/models/injector/Injector";
import { ActivityService } from "../../src/services/ActivityService";
import { DynamoDBMockService } from "../models/DynamoDBMockService";
import { HTTPResponse } from "../../src/utils/HTTPResponse";
import { HTTPRESPONSE } from "../../src/assets/enums";
import { updateActivity } from "../../src/functions/updateActivity";
import lambdaTester from "lambda-tester";

const visitId: string = "5e4bd304-446e-4678-8289-d34fca9256e8";
describe("updateActivity", () => {
    const existingId: string = "5e4bd304-446e-4678-8289-d34fca925612"; // Existing ID
    const lambda = lambdaTester(updateActivity);
    context("when the updateActivity function is invoked", () => {
        const payload: any = [
            {id: existingId, waitReason: ["Other", "Waiting for vehicle"], notes: "sample"}
        ];
        it("should respond with HTTP 204", () => {
            return lambda.event(payload)
                .expectResolve((response: any) => {
                    expect("access-control-allow-origin", "*");
                    expect("access-control-allow-credentials", "true");
                    expect(204);
                });
        });
    });

    const activityService: ActivityService = Injector.resolve<ActivityService>(ActivityService, [DynamoDBMockService]);
    const activityId: string = "9e4b9304-446e-4678-8289-d34fca9259e4"; // Existing ID

    context("when the payload is malformed", () => {
        const payload: any = [
            {id: activityId, notes: "sample"}
        ];
        it("should return an error", () => {
            return activityService.updateActivity(payload)
                .then(() => {
                    // The update should not succeed
                    expect.fail();
                })
                .catch((error: HTTPResponse) => {
                    const body: any = JSON.parse(error.body);
                    expect(body.error).to.equal("\"waitReason\" is required");
                });
        });
    });

    context("when the activity does not exist", () => {
        const payload: any = [
            {id: "non-existing-id", waitReason: ["Other", "Waiting for vehicle"], notes: "sample"}
        ];
        it("should return an error", () => {
            return activityService.updateActivity(payload)
            .then(() => {
                // The update should not succeed
                expect.fail();
            })
            .catch((error: HTTPResponse) => {
                const body: any = JSON.parse(error.body);
                expect(body.error).to.equal(`${HTTPRESPONSE.NOT_EXIST}`);
            });
        });
    });

    context("when the activity was successfully updated", () => {
        // Create visit activity and then update it
        let createdId: string = "test";
        let waitId: string = "waitId";
        const visitPayload: any = {
            activityType: "visit",
            testStationName: "Rowe, Wunsch and Wisoky",
            testStationPNumber: "87-1369569",
            testStationEmail: "teststationname@dvsa.gov.uk",
            testStationType: "gvts",
            testerName: "Gica",
            testerStaffId: "132"
        };
        it("should return a uuid", () => {
            return activityService.createActivity(visitPayload)
                .then((result: { id: string }) => {
                    createdId = result.id;
                    console.log(`Created visit: ${createdId}`);
                })
                .catch((error: HTTPResponse) => {
                    console.error(`Error creating visit activity.`);
                });
        });
        // Create wait activity
        const waitPayload: any = {
            parentId: createdId,
            activityType: "wait",
            testStationName: "Rowe, Wunsch and Wisoky",
            testStationPNumber: "87-1369569",
            testStationEmail: "teststationname@dvsa.gov.uk",
            testStationType: "gvts",
            testerName: "Gica",
            testerStaffId: "132",
            startTime: new Date().toISOString(),
            endTime: new Date().toISOString(),
            waitReason: [],
            notes: null
        };

        it("should return a uuid", () => {
            return activityService.createActivity(waitPayload)
                .then((result: { id: string }) => {
                    waitId = result.id;
                    console.log(`Created wait: ${waitId}`);
                })
                .catch((error: HTTPResponse) => {
                    console.error(`Error creating visit activity.`);
                });
        });

        const payload: any = [
            {id: waitId, waitReason: ["Waiting for vehicle"], notes: "sample"}
        ];
        it("should return void", async () => {
            // If the call does not throw errors, it is successful
            return activityService.updateActivity(payload)
                .catch((error: HTTPResponse) => {
                    console.error(`Error occurred: ${error.statusCode}`);
                    expect.fail();
                });
        });
    });

    context("when the waitReason does not meet the requirements", () => {
        const payload: any = [
            {id: activityId, waitReason: ["invalidReason", "Waiting for vehicle"], notes: null}
        ];
        it("should return an error", async () => {
            return activityService.updateActivity(payload)
                .then(() => {
                    // The update should not succeed
                    expect.fail();
                })
                .catch((error: HTTPResponse) => {
                    const body: any = JSON.parse(error.body);
                    expect(body.error).to.equal("\"waitReason\" at position 0 does not match any of the allowed types");
                });
        });
    });
});
