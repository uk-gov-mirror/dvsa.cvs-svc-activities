import {endActivity} from "../../src/functions/endActivity";
import {ActivityService} from "../../src/services/ActivityService";
import mockContext from "aws-lambda-mock-context"; import {HTTPResponse} from "../../src/utils/HTTPResponse";

describe("startActivity Function", () => {
  context("calls activity service", () => {
    const ctx  = mockContext();
    context("gets a successful response", () => {
      it("returns 201 and stringinfied empty string as body", async () => {
        ActivityService.prototype.endActivity = jest.fn().mockResolvedValue(1234);
        const resp: HTTPResponse = await endActivity({pathParameters: {id: 1}}, ctx, () => { return; });
        expect(resp).toBeInstanceOf(HTTPResponse);
        expect(resp.statusCode).toEqual(204);
        expect(resp.body).toEqual(JSON.stringify(""));
      });
    });

    context("gets an unsuccessful response", () => {
      it("returns the thrown  error", async () => {
        ActivityService.prototype.endActivity = jest.fn().mockRejectedValue(new Error("Oh No!"));
        try {
          await endActivity({pathParameters: {id: 1}}, ctx, () => { return; });
        } catch (e) {
          expect(e.message).toEqual("Oh No!");
        }
      });
    });
  });
});
