import { describe, Done } from "mocha";
import { Injector } from "../../src/models/injector/Injector";
import { ActivityService } from "../../src/services/ActivityService";
import { Configuration } from "../../src/utils/Configuration";
import supertest from "supertest";
import { DocumentClient } from "aws-sdk/lib/dynamodb/document_client";
import { updateActivity } from "../../src/functions/updateActivity";
import {APIGatewayProxyResult, Callback, Context, Handler} from "aws-lambda";
import lambdaTester from "lambda-tester";
import {expect} from "chai";

const config: any = Configuration.getInstance().getConfig();
const request = supertest(`http://localhost:${config.serverless.port}`);
const activityService: ActivityService = Injector.resolve<ActivityService>(ActivityService);

const activityId: string = "5e4bd304-446e-4678-8289-d34fca925612"; // Existing ID

describe("PUT /activities/update", () => {
    const lambda = lambdaTester(updateActivity);
    context("when the updateActivity function is invoked", () => {
        const payload: any = [
            {id: activityId, waitReason: ["Other", "Waiting for vehicle"], notes: "sample"}
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


    context("when the payload is malformed", () => {
        const payload: any = {
            badAttr: "badValue"
        };
        it("should respond with HTTP 400", () => {
            return request.put(`/activities/update`)
                .send(payload)
                .expect("access-control-allow-origin", "*")
                .expect("access-control-allow-credentials", "true")
                .expect(400);
        });
    });

    context("when a non-existing activity is updated", () => {
        const payload: any = [
            {id: "non-existing-id", waitReason: ["Break"], notes: "sample"}
                ];
        it("should respond with HTTP 404", () => {
            return request.put(`/activities/update`)
                .send(payload)
                .expect("access-control-allow-origin", "*")
                .expect("access-control-allow-credentials", "true")
                .expect(404);
        });
    });

    context("when an existing activity is updated successfully", () => {
        const payload: any = [
            {id: activityId, waitReason: ["Other", "Waiting for vehicle"], notes: "sample"}
        ];
        it("should respond with HTTP 204", () => {
            return request.put(`/activities/update`)
                .send(payload)
                .expect("access-control-allow-origin", "*")
                .expect("access-control-allow-credentials", "true")
                .expect(204);
        });
    });

    context("When the payload is empty", () => {
        it("should return a HTTP 400, bad request", () => {
            return request.put(`/activities/update`)
                .send()
                .expect(400);
        });
    });
});
