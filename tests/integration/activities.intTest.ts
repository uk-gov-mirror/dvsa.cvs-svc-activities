import { describe, Done } from "mocha";
import { expect } from "chai";
import { Injector } from "../../src/models/injector/Injector";
import { ActivityService } from "../../src/services/ActivityService";
import { ActivityType, IActivity, StationType } from "../../src/models/Activity";
import { Configuration } from "../../src/utils/Configuration";
import supertest, { Response } from "supertest";
import { DocumentClient } from "aws-sdk/lib/dynamodb/document_client";

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

describe("GET /activities/details", () => {
    const queryEventParams = {
        fromStartTime: "2014-02-12",
        toStartTime: "2019-02-12",
        activityType: "visit",
        testStationPNumber: "87-1369561",
        testerStaffId: "132"
    };
    context("when no parameters were passed", () => {
        it("should respond with HTTP 400", () => {
            return request.get("/activities/details")
                .expect("access-control-allow-origin", "*")
                .expect("access-control-allow-credentials", "true")
                .expect(400);
        });
    });
    context("when all the parameters were passed", () => {
        it("should respond with HTTP 200", () => {
            return request.get("/activities/details/?activityType=" + queryEventParams.activityType +
                "&fromStartTime=" + queryEventParams.fromStartTime +
                "&toStartTime=" + queryEventParams.toStartTime +
                "&testerStaffId=" + queryEventParams.testerStaffId +
                "&testStationPNumber=" + queryEventParams.testStationPNumber)
                .expect("access-control-allow-origin", "*")
                .expect("access-control-allow-credentials", "true")
                .expect(200)
                .then((response: Response) => {
                    expect(response.body).to.not.have.lengthOf(0);
                });
        });
    });
    context("when the fromStartTime parameter was not passed", () => {
        it("should respond with HTTP 400", () => {
            return request.get("/activities/details/?activityType=" + queryEventParams.activityType +
                "&toStartTime=" + queryEventParams.toStartTime +
                "&testerStaffId=" + queryEventParams.testerStaffId +
                "&testStationPNumber=" + queryEventParams.testStationPNumber)
                .expect("access-control-allow-origin", "*")
                .expect("access-control-allow-credentials", "true")
                .expect(400);
        });
    });
    context("when all the parameters were passed", () => {
        context("but no data received from the database", () => {
            it("should respond with HTTP 404", () => {
                queryEventParams.fromStartTime = "2020-02-12";
                return request.get("/activities/details/?activityType=" + queryEventParams.activityType +
                    "&fromStartTime=" + queryEventParams.fromStartTime +
                    "&toStartTime=" + queryEventParams.toStartTime +
                    "&testerStaffId=" + queryEventParams.testerStaffId +
                    "&testStationPNumber=" + queryEventParams.testStationPNumber)
                    .expect("access-control-allow-origin", "*")
                    .expect("access-control-allow-credentials", "true")
                    .expect(404);
            });
        });
    });
});

