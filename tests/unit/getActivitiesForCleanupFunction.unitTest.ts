import { GetActivityService } from '../../src/services/GetActivitiesService';
import { HTTPResponse } from '../../src/utils/HTTPResponse';
import { getActivitiesForCleanup } from '../../src/functions/getActivitiesForCleanup';
import { HTTPRESPONSE } from '../../src/assets/enums';
import { Context } from 'aws-lambda';
import { ActivityType } from '@dvsa/cvs-type-definitions/types/v1/enums/activityType.enum';

describe('getActivitiesForCleanup Function', () => {
  context('calls activity service', () => {
    // @ts-ignore
    const ctx: Context = null;
    context('gets a successful response', () => {
      it('returns 200 and the array of activities', async () => {
        const expectedResponse = [{ testActivity: 1234 }];
        GetActivityService.prototype.getActivities = jest
          .fn()
          .mockResolvedValue(expectedResponse);
        const resp: HTTPResponse = await getActivitiesForCleanup(
          {
            queryStringParameters: {
              activityType: ActivityType.VISIT,
              isOpen: true
            }
          },
          ctx,
          () => {
            return;
          }
        );
        expect(resp).toBeInstanceOf(HTTPResponse);
        expect(resp.statusCode).toEqual(200);
        expect(resp.body).toEqual(JSON.stringify(expectedResponse));
      });
    });

    context('gets an unsuccessful response', () => {
      it('returns a Bad Request error if all required query parameters are not provided', async () => {
        try {
          await getActivitiesForCleanup(
            {
              queryStringParameters: {
                isOpen: true
              }
            },
            ctx,
            () => {
              return;
            }
          );
        } catch (e: any) {
          expect(e.statusCode).toEqual(400);
          expect(e.message).toEqual(HTTPRESPONSE.BAD_REQUEST);
        }
      });

      it('returns a Bad Request error if no query parameters are provided', async () => {
        try {
          await getActivitiesForCleanup({}, ctx, () => {
            return;
          });
        } catch (e: any) {
          expect(e.statusCode).toEqual(400);
          expect(e.message).toEqual(HTTPRESPONSE.BAD_REQUEST);
        }
      });

      it('returns a Bad Request error if no event is provided', async () => {
        try {
          await getActivitiesForCleanup(null, ctx, () => {
            return;
          });
        } catch (e: any) {
          expect(e.statusCode).toEqual(400);
          expect(e.message).toEqual(HTTPRESPONSE.BAD_REQUEST);
        }
      });

      it('returns the thrown error', async () => {
        GetActivityService.prototype.getActivities = jest
          .fn()
          .mockRejectedValue(new Error('Oh No!'));
        try {
          await getActivitiesForCleanup(
            { queryStringParameters: { fromStartTime: '2020-07-22' } },
            ctx,
            () => {
              return;
            }
          );
        } catch (e: any) {
          expect(e.message).toEqual('Oh No!');
        }
      });
    });
  });
});
