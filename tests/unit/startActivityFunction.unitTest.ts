import {startActivity} from "../../src/functions/startActivity";
import {ActivityService} from "../../src/services/ActivityService";
import mockContext from "aws-lambda-mock-context";
import {HTTPResponse} from "../../src/utils/HTTPResponse";

describe("startActivity Function", () => {
  context("calls activity service", () => {
    const ctx  = mockContext();
    context("gets a successful response", () => {
      it("returns 201 and stringified id of created Activity", async () => {
        ActivityService.prototype.createActivity = jest.fn().mockResolvedValue(1234);
        const resp: HTTPResponse = await startActivity({}, ctx, () => { return; });
        expect(resp).toBeInstanceOf(HTTPResponse);
        expect(resp.statusCode).toEqual(201);
        expect(resp.body).toEqual(JSON.stringify(1234));
      });
    });

    context("gets an unsuccessful response", () => {
      it("returns the thrown  error", async () => {
        ActivityService.prototype.createActivity = jest.fn().mockRejectedValue(new Error("Oh No!"));
        try {
          const resp: HTTPResponse = await startActivity({}, ctx, () => { return; });
        } catch (e) {
          expect(e.message).toEqual("Oh No!");
        }
      });
    });
  });
});
