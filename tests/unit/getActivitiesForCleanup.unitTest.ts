import { GetActivityService } from '../../src/services/GetActivitiesService';
import { HTTPRESPONSE } from '../../src/assets/enums';

describe('GetActivitiesForCleanup', () => {
  describe('GetActivitiesForCleanup function', () => {
    describe('when DB query returns data', () => {
      it('returns the array of activities', async () => {
        const mockActivities = [{ activity1: 'hello' }, { activity2: 'world' }];
        const mockDB = jest.fn().mockImplementation(() => {
          return {
            getActivitiesWhereStartTimeGreaterThan: () => {
              return Promise.resolve({ Count: 2, Items: mockActivities });
            }
          };
        });
        const svc = new GetActivityService(new mockDB());
        expect.assertions(1);
        const output = await svc.getActivitiesForCleanup('abc123');
        expect(output).toEqual(mockActivities);
      });
    });
    describe('when DB query returns no data', () => {
      it('returns 404 No data found', async () => {
        const mockDB = jest.fn().mockImplementation(() => {
          return {
            getActivitiesWhereStartTimeGreaterThan: () => {
              return Promise.resolve({ Count: 0 });
            }
          };
        });
        const svc = new GetActivityService(new mockDB());
        expect.assertions(2);
        try {
          expect(await svc.getActivitiesForCleanup('abc123')).toThrowError();
        } catch (e) {
          expect(e.statusCode).toEqual(404);
          expect(e.message).toEqual(HTTPRESPONSE.NO_RESOURCES);
        }
      });
    });
    describe('when DB query throws error', () => {
      it('throws new error', async () => {
        const mockDB = jest.fn().mockImplementation(() => {
          return {
            getActivitiesWhereStartTimeGreaterThan: () => {
              return Promise.reject({ statusCode: 418, message: 'It broke!' });
            }
          };
        });
        const svc = new GetActivityService(new mockDB());
        expect.assertions(1);
        try {
          await svc.getActivitiesForCleanup('abc123');
        } catch (e) {
          expect(e.statusCode).toEqual(418);
        }
      });
    });
  });
});
