import { getActivity } from '../../src/functions/getActivity';
import { GetActivityService } from '../../src/services/GetActivitiesService';
import mockContext from 'aws-lambda-mock-context';
import { HTTPResponse } from '../../src/utils/HTTPResponse';

describe('startActivity Function', () => {
  context('calls activity service', () => {
    const ctx = mockContext();
    context('gets a successful response', () => {
      it('returns 201 and stringinfied empty string as body', async () => {
        GetActivityService.prototype.getActivities = jest
          .fn()
          .mockResolvedValue({ testResponse: 1234 });
        const resp: HTTPResponse = await getActivity({ pathParameters: { id: 1 } }, ctx, () => {
          return;
        });
        expect(resp).toBeInstanceOf(HTTPResponse);
        expect(resp.statusCode).toEqual(200);
        expect(resp.body).toEqual(JSON.stringify({ testResponse: 1234 }));
        return;
      });
    });

    context('gets an unsuccessful response', () => {
      it('returns the thrown  error', async () => {
        GetActivityService.prototype.getActivities = jest
          .fn()
          .mockRejectedValue(new Error('Oh No!'));
        try {
          await getActivity({ pathParameters: { id: 1 } }, ctx, () => {
            return;
          });
        } catch (e) {
          expect(e.message).toEqual('Oh No!');
        }
        return;
      });
    });
  });
});
