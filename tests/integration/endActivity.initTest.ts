import { describe, Done } from "mocha";
import { Injector } from "../../src/models/injector/Injector";
import { ActivityService } from "../../src/services/ActivityService";
import { Configuration } from "../../src/utils/Configuration";
import supertest, { Response } from "supertest";
import { DocumentClient } from "aws-sdk/lib/dynamodb/document_client";

const config: any = Configuration.getInstance().getConfig();
const request = supertest(`http://localhost:${config.serverless.port}`);
const activityService: ActivityService = Injector.resolve<ActivityService>(ActivityService);

const postedActivity: DocumentClient.Key = {};

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
