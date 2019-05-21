import { describe, Done } from "mocha";
import { Injector } from "../../src/models/injector/Injector";
import { ActivityService } from "../../src/services/ActivityService";
import { Configuration } from "../../src/utils/Configuration";
import supertest from "supertest";
import { DocumentClient } from "aws-sdk/lib/dynamodb/document_client";
import {ActivityType} from "../../src/models/Activity";

const config: any = Configuration.getInstance().getConfig();
const request = supertest(`http://localhost:${config.serverless.port}`);
const activityService: ActivityService = Injector.resolve<ActivityService>(ActivityService);

const postedActivity: DocumentClient.Key = {};
const activityId: string = "5e4bd304-446e-4678-8289-d34fca925612"; // Existing ID

describe("PUT /activities/update", () => {
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

    after((done: Done) => {
        activityService.dbClient.delete(postedActivity)
            .then(() => done());
    });
});
