import { ActivityService } from '../../src/services/ActivityService';
import { updateActivity } from '../../src/functions/updateActivity';
import lambdaTester from 'lambda-tester';

describe('Activity lambda - updateActivity path', () => {
  const existingId: string = '5e4bd304-446e-4678-8289-d34fca925612'; // Existing ID
  beforeEach(() => {
    jest.restoreAllMocks();
  });
  afterAll(() => {
    jest.restoreAllMocks();
    jest.resetModules();
  });
  context('when the updateActivity function is invoked', () => {
    const payload: any = {
      body: [
        {
          id: existingId,
          waitReason: ['Other', 'Waiting for vehicle'],
          notes: 'sample'
        }
      ]
    };
    it('should respond with HTTP 204', () => {
      ActivityService.prototype.updateActivity = jest.fn().mockResolvedValue('Success');
      const lambda = lambdaTester(updateActivity);
      lambda.event(payload).expectResolve((response: any) => {
        expect(response.headers['Access-Control-Allow-Origin']).toEqual('*');
        expect(response.headers['Access-Control-Allow-Credentials']).toEqual(true);
        expect(response.statusCode).toEqual(204);
      });
    });
  });
});
