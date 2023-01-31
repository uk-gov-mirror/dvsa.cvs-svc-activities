import { startActivity } from '../../src/functions/startActivity';
import { ActivityService } from '../../src/services/ActivityService';
import { HTTPResponse } from '../../src/utils/HTTPResponse';
import { Context } from 'aws-lambda';

describe('startActivity Function', () => {
  // @ts-ignore
  const ctx: Context = null ;
  context('calls activity service', () => {
    context('gets a successful response', () => {
      it('returns 201 and stringified id of created Activity', async () => {
        ActivityService.prototype.createActivity = jest.fn().mockResolvedValue(1234);
        const resp: HTTPResponse = await startActivity({}, ctx, () => {
          return;
        });
        expect(resp).toBeInstanceOf(HTTPResponse);
        expect(resp.statusCode).toEqual(201);
        expect(resp.body).toEqual(JSON.stringify(1234));
      });
    });

    context('gets an unsuccessful response', () => {
      it('returns the thrown  error', async () => {
        ActivityService.prototype.createActivity = jest
          .fn()
          .mockRejectedValue(new Error('Oh No!'));
        try {
          const resp: HTTPResponse = await startActivity({}, ctx, () => {
            return;
          });
        } catch (e: any) {
          expect(e.message).toEqual('Oh No!');
        }
      });
    });
  });
});
