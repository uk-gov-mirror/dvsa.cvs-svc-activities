import { endActivity } from '../../src/functions/endActivity';
import { ActivityService } from '../../src/services/ActivityService';
import mockContext from 'aws-lambda-mock-context';
import { HTTPResponse } from '../../src/utils/HTTPResponse';
import { HTTPRESPONSE } from '../../src/assets/enums';

describe('endActivity Function', () => {
  context('calls activity service', () => {
    const ctx = mockContext();
    context('gets a successful response', () => {
      it('returns 200 containing the response body value', async () => {
        ActivityService.prototype.endActivity = jest
          .fn()
          .mockResolvedValue({ wasVisitAlreadyClosed: false });
        const resp: HTTPResponse = await endActivity({ pathParameters: { id: '1' } }, ctx, () => {
          return;
        });
        expect(resp).toBeInstanceOf(HTTPResponse);
        expect(resp.statusCode).toEqual(200);
        expect(resp.body).toEqual(JSON.stringify({ wasVisitAlreadyClosed: false }));
      });
    });

    context('gets an unsuccessful response', () => {
      it('returns the thrown  error', async () => {
        ActivityService.prototype.endActivity = jest.fn().mockRejectedValue(new Error('Oh No!'));
        try {
          await endActivity({ pathParameters: { id: '1' } }, ctx, () => {
            return;
          });
        } catch (e) {
          expect(e.message).toEqual('Oh No!');
        }
      });
      it('returns BAD REQUEST error when path parameter is an empty string', async () => {
        ActivityService.prototype.endActivity = jest
          .fn()
          .mockResolvedValue({ wasVisitAlreadyClosed: false });
        const resp: HTTPResponse = await endActivity({ pathParameters: { id: ' ' } }, ctx, () => {
          return;
        });
        expect(resp).toBeInstanceOf(HTTPResponse);
        expect(resp.statusCode).toEqual(400);
        expect(resp.body).toEqual(JSON.stringify(HTTPRESPONSE.BAD_REQUEST));
      });
      it('returns BAD REQUEST error when path parameter is the string "undefined"', async () => {
        ActivityService.prototype.endActivity = jest
          .fn()
          .mockResolvedValue({ wasVisitAlreadyClosed: false });
        const resp: HTTPResponse = await endActivity(
          { pathParameters: { id: 'undefined' } },
          ctx,
          () => {
            return;
          }
        );
        expect(resp).toBeInstanceOf(HTTPResponse);
        expect(resp.statusCode).toEqual(400);
        expect(resp.body).toEqual(JSON.stringify(HTTPRESPONSE.BAD_REQUEST));
      });
      it('returns BAD REQUEST error when path parameter is the string "null"', async () => {
        ActivityService.prototype.endActivity = jest
          .fn()
          .mockResolvedValue({ wasVisitAlreadyClosed: false });
        const resp: HTTPResponse = await endActivity(
          { pathParameters: { id: 'null' } },
          ctx,
          () => {
            return;
          }
        );
        expect(resp).toBeInstanceOf(HTTPResponse);
        expect(resp.statusCode).toEqual(400);
        expect(resp.body).toEqual(JSON.stringify(HTTPRESPONSE.BAD_REQUEST));
      });
      it('returns BAD REQUEST error when path parameter is undefined', async () => {
        ActivityService.prototype.endActivity = jest
          .fn()
          .mockResolvedValue({ wasVisitAlreadyClosed: false });
        const resp: HTTPResponse = await endActivity(
          { pathParameters: { id: undefined } },
          ctx,
          () => {
            return;
          }
        );
        expect(resp).toBeInstanceOf(HTTPResponse);
        expect(resp.statusCode).toEqual(400);
        expect(resp.body).toEqual(JSON.stringify(HTTPRESPONSE.BAD_REQUEST));
      });
      it('returns BAD REQUEST error when path parameter is null', async () => {
        ActivityService.prototype.endActivity = jest
          .fn()
          .mockResolvedValue({ wasVisitAlreadyClosed: false });
        const resp: HTTPResponse = await endActivity(
          { pathParameters: { id: undefined } },
          ctx,
          () => {
            return;
          }
        );
        expect(resp).toBeInstanceOf(HTTPResponse);
        expect(resp.statusCode).toEqual(400);
        expect(resp.body).toEqual(JSON.stringify(HTTPRESPONSE.BAD_REQUEST));
      });
    });
  });
});
