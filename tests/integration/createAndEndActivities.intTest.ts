import { describe, Done } from "mocha";
import { expect } from "chai";
import { ActivityType, IActivity, StationType } from "../../src/models/Activity";
import { Configuration } from "../../src/utils/Configuration";
import supertest, { Response } from "supertest";
import { DocumentClient } from "aws-sdk/lib/dynamodb/document_client";
import {ActivityService} from "../../src/services/ActivityService";
import {Injector} from "../../src/models/injector/Injector";

const config: any = Configuration.getInstance().getConfig();
const request = supertest(`http://localhost:${config.serverless.port}`);
const activityService: ActivityService = Injector.resolve<ActivityService>(ActivityService);

let postedActivity: DocumentClient.Key = {};

describe("POST /activities", () => {

    context("when a new activity is started", () => {
        context("and the payload is malformed", () => {
            const payload: any = {
                activityType: ActivityType.visit,
                badAttr: "badValue",
                testStationPNumber: "87-1369569",
                testStationEmail: "malformed",
                testStationType: StationType.gvts,
                testerName: "Gica"
            };

            it("should respond with HTTP 400", () => {
                return request.post("/activities")
                    .send(payload)
                    .expect("access-control-allow-origin", "*")
                    .expect("access-control-allow-credentials", "true")
                    .expect(400);
            });
        });

        context("and the payload is correct", () => {
            const payload: IActivity = {
                activityType: ActivityType.visit,
                testStationName: "Rowe, Wunsch and Wisoky",
                testStationPNumber: "87-1369569",
                testStationEmail: "teststationname@dvsa.gov.uk",
                testStationType: StationType.gvts,
                testerName: "Dorel",
                testerStaffId: "1664"
            };

            it("should respond with HTTP 201", () => {
                return request.post("/activities")
                    .send(payload)
                    .expect("access-control-allow-origin", "*")
                    .expect("access-control-allow-credentials", "true")
                    .expect(201)
                    .then((response: Response) => {
                        expect(response.body).to.have.property("id");
                        expect(response.body.id).to.match(/[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}/);

                        postedActivity = { id: response.body.id };
                    });
            });
        });
    });

});


/**
 * End Activities (PUT) tests
 */
// endActivity tests put here instead of separate as they use variables from the tests created above which are difficult to get access to otherwise.

describe("PUT /activities/:id/end", () => {

    context("when a non-existing activity is ended", () => {
        it("should respond with HTTP 201", () => {
            return request.put(`/activities/bad_id/end`)
                .send({})
                .expect("access-control-allow-origin", "*")
                .expect("access-control-allow-credentials", "true")
                .expect(404);
        });
    });

    context("when an existing activity is ended", () => {
        it("should respond with HTTP 204", () => {

            // End the just-create test activity
            return request.put(`/activities/${postedActivity.id}/end`)
                .expect("access-control-allow-origin", "*")
                .expect("access-control-allow-credentials", "true")
                .expect(204);
        });
    });

    context("when an already ended activity is ended", () => {
        it("should respond with HTTP 403", () => {
            return request.put(`/activities/${postedActivity.id}/end`)
                .expect("access-control-allow-origin", "*")
                .expect("access-control-allow-credentials", "true")
                .expect(403);
        });
    });

    after((done: Done) => {
        activityService.dbClient.delete(postedActivity)
            .then(() => done());
    });
});
