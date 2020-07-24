import {GetActivityService} from "../../src/services/GetActivitiesService";
import mockContext from "aws-lambda-mock-context";
import {HTTPResponse} from "../../src/utils/HTTPResponse";
import {getActivitiesForCleanup} from "../../src/functions/getActivitiesForCleanup";
import {HTTPRESPONSE} from "../../src/assets/enums";

describe("getActivitiesForCleanup Function", () => {
    context("calls activity service", () => {
        const ctx  = mockContext();
        context("gets a successful response", () => {
            it("returns 200 and the array of activities", async () => {
                const expectedResponse = [{testActivity: 1234}];
                GetActivityService.prototype.getActivitiesForCleanup = jest.fn().mockResolvedValue(expectedResponse);
                const resp: HTTPResponse = await getActivitiesForCleanup({queryStringParameters: {fromStartTime: "2020-07-22"}}, ctx, () => { return; });
                expect(resp).toBeInstanceOf(HTTPResponse);
                expect(resp.statusCode).toEqual(200);
                expect(resp.body).toEqual(JSON.stringify(expectedResponse));
            });
        });

        context("gets an unsuccessful response", () => {
            it("returns a Bad Request error if query parameter 'fromStartTime is not provided", async () => {
                try {
                    await getActivitiesForCleanup({}, ctx, () => { return; });
                } catch (e) {
                    expect(e.statusCode).toEqual(400);
                    expect(e.message).toEqual(HTTPRESPONSE.BAD_REQUEST);
                }
            });

            it("returns the thrown error", async () => {
                GetActivityService.prototype.getActivitiesForCleanup = jest.fn().mockRejectedValue(new Error("Oh No!"));
                try {
                    await getActivitiesForCleanup({queryStringParameters: {fromStartTime: "2020-07-22"}}, ctx, () => { return; });
                } catch (e) {
                    expect(e.message).toEqual("Oh No!");
                }
            });
        });
    });
});
