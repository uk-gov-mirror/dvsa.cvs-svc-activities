import { handler } from '../../src/handler';
import { Configuration } from '../../src/utils/Configuration';
import { HTTPResponse } from '../../src/utils/HTTPResponse';
import { Context } from 'aws-lambda';
import { ActivityService } from '../../src/services/ActivityService';
import { GetActivityService } from '../../src/services/GetActivitiesService';
const opts = Object.assign({
  timeout: 0.2
});

describe('The lambda function handler', () => {
  afterAll(() => {
    jest.resetModules();
  });
  context('With correct Config', () => {
    context('should correctly handle incoming events', () => {
      beforeEach(() => {
        jest.resetAllMocks();
      });

      it('should call getActivities function when called with appropriate event payload', async () => {
        // Specify your event, with correct path, payload etc
        const testEvent = {
          path: '/activities/details/',
          pathParameters: null,
          resource: '/activities/details/',
          httpMethod: 'GET',
          queryStringParameters: {}
        };

        // Stub out the actual functions
        GetActivityService.prototype.getActivities = jest
          .fn()
          .mockResolvedValue({ testResponse: 1234 });

        // @ts-ignore
        const ctx: Context = null;
        const result = await handler(testEvent, ctx, () => {
          return;
        });
        // ctx.succeed(result);
        expect(result.statusCode).toEqual(200);
        expect(GetActivityService.prototype.getActivities).toHaveBeenCalled();
      });
      it('should call startActivities function when called with appropriate event payload', async () => {
        // Specify your event, with correct path, payload etc
        const testEvent = {
          path: '/activities/',
          pathParameters: null,
          resource: '/activities/',
          httpMethod: 'POST',
          queryStringParameters: null
        };

        // Stub out the actual functions
        ActivityService.prototype.createActivity = jest
          .fn()
          .mockResolvedValue({ testResponse: 1234 });

        // @ts-ignore
        const ctx: Context = null;
        const result = await handler(testEvent, ctx, () => {
          return;
        });
        // ctx.succeed(result);
        // ctx = null;
        expect(result.statusCode).toEqual(201);
        expect(ActivityService.prototype.createActivity).toHaveBeenCalled();
      });
      it('should call updateActivities function when called with appropriate event payload', async () => {
        // Specify your event, with correct path, payload etc
        const testEvent = {
          path: '/activities/update',
          pathParameters: null,
          resource: '/activities/update',
          httpMethod: 'PUT',
          queryStringParameters: null,
          body: JSON.stringify([{ testParam: true }])
        };

        // Stub out the actual functions
        ActivityService.prototype.updateActivity = jest
          .fn()
          .mockResolvedValue({ testResponse: 1234 });

        // @ts-ignore
        const ctx: Context = null;
        const result = await handler(testEvent, ctx, () => {
          return;
        });
        // ctx.succeed(result);
        expect(result.statusCode).toEqual(204);
        expect(ActivityService.prototype.updateActivity).toHaveBeenCalled();
      });
      it('should call endActivities function when called with appropriate event payload', async () => {
        // Specify your event, with correct path, payload etc
        const testEvent = {
          path: '/activities/1/end',
          pathParameters: { id: 1 },
          resource: '/activities/1/end',
          httpMethod: 'PUT',
          queryStringParameters: null,
          body: JSON.stringify([{ testParam: true }])
        };

        // Stub out the actual functions
        ActivityService.prototype.endActivity = jest
          .fn()
          .mockResolvedValue({ wasVisitAlreadyClosed: true });
        // @ts-ignore
        const ctx: Context = null;
        const result = await handler(testEvent, ctx, () => {
          return;
        });
        // ctx.succeed(result);

        const { body, statusCode } = result;
        const { wasVisitAlreadyClosed } = JSON.parse(body);

        expect(ActivityService.prototype.endActivity).toHaveBeenCalledTimes(1);
        expect(statusCode).toEqual(200);
        expect(wasVisitAlreadyClosed).toBe(true);
      });

      it('should return error on empty event', async () => {
        // @ts-ignore
        const ctx: Context = null;
        const result = await handler(null, ctx, () => {
          return;
        });
        // ctx.succeed(result);

        expect(result).toBeInstanceOf(HTTPResponse);
        expect(result.statusCode).toEqual(400);
        expect(result.body).toEqual(JSON.stringify('AWS event is empty. Check your test event.'));
      });

      it('should return error on invalid body json', async () => {
        const invalidBodyEvent: any = {};
        invalidBodyEvent.body = '{"hello":}';

        // @ts-ignore
        const ctx: Context = null;
        const result = await handler(invalidBodyEvent, ctx, () => {
          return;
        });
        // ctx.succeed(result);
        expect(result).toBeInstanceOf(HTTPResponse);
        expect(result.statusCode).toEqual(400);
        expect(result.body).toEqual(JSON.stringify('Body is not a valid JSON.'));
      });

      it('should return a Route Not Found error on invalid path', async () => {
        const invalidPathEvent: any = {};
        invalidPathEvent.path = '/vehicles/123/doesntExist';

        // @ts-ignore
        const ctx: Context = null;
        const result = await handler(invalidPathEvent, ctx, () => {
          return;
        });
        // ctx.succeed(result);
        expect(result.statusCode).toEqual(400);
        expect(result.body).toStrictEqual(
          JSON.stringify({
            error: `Route ${invalidPathEvent.httpMethod} ${invalidPathEvent.path} was not found.`
          })
        );
      });
    });
  });

  context('With no routes defined in config', () => {
    it('should return a Route Not Found error', async () => {
      const getFunctions = Configuration.prototype.getFunctions;
      Configuration.prototype.getFunctions = jest.fn().mockImplementation(() => []);
      const eventNoRoute = { httpMethod: 'GET', path: '' };
      // @ts-ignore
      const ctx: Context = null;
      const result = await handler(eventNoRoute, ctx, () => {
        return;
      });
      // ctx.succeed(result);
      expect(result.statusCode).toEqual(400);
      expect(result.body).toEqual(
        JSON.stringify({
          error: `Route ${eventNoRoute.httpMethod} ${eventNoRoute.path} was not found.`
        })
      );
      Configuration.prototype.getFunctions = getFunctions;
    });
  });
});
