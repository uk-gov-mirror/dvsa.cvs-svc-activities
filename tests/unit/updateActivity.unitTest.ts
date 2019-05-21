import { describe } from "mocha";
import { expect } from "chai";
import { Injector } from "../../src/models/injector/Injector";
import { ActivityService } from "../../src/services/ActivityService";
import { DynamoDBMockService } from "../models/DynamoDBMockService";
import { HTTPResponse } from "../../src/utils/HTTPResponse";
import { HTTPRESPONSE } from "../../src/assets/enums";

describe("updateActivity", () => {
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
/*
    context("when the activity was successfully updated", () => {
        const payload: any = [
            {id: activityId, waitReason: ["Other", "Waiting for vehicle"], notes: "sample"}
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
*/
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
