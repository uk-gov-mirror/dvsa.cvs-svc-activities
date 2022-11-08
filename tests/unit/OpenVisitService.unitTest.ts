import OpenVisitService from '../../src/services/OpenVisitService';
import * as jsonData from '../resources/activities.json';

describe('OpenVisitService', () => {
  describe('checkOpenVisit function', () => {
    describe('when DB query returns open visits', () => {
      it('returns true', async () => {
        // Only care about the size of the return, not the content
        const mockDB = jest.fn().mockImplementation(() => {
          return {
            getOngoingByStaffId: () => {
              return Promise.resolve(Array.of(jsonData));
            }
          };
        });
        const svc = new OpenVisitService(new mockDB());
        expect.assertions(1);
        const output = await svc.checkOpenVisit('abc123');
        expect(output).toEqual(true);
      });
    });
    describe('when DB query returns no open visits', () => {
      it('returns false', async () => {
        // Only care about the size of the return, not the content
        const mockDB = jest.fn().mockImplementation(() => {
          return {
            getOngoingByStaffId: () => {
              return Promise.resolve([]);
            }
          };
        });
        const svc = new OpenVisitService(new mockDB());
        expect.assertions(1);
        const output = await svc.checkOpenVisit('abc123');
        expect(output).toEqual(false);
      });
    });
    describe('when DB query throws error', () => {
      it('throws new error', async () => {
        // Only care about the size of the return, not the content
        const mockDB = jest.fn().mockImplementation(() => {
          return {
            getOngoingByStaffId: () => {
              return Promise.reject({
                statusCode: 418,
                message: 'It broke!'
              });
            }
          };
        });
        const svc = new OpenVisitService(new mockDB());
        expect.assertions(1);
        try {
          await svc.checkOpenVisit('abc123');
        } catch (e) {
          expect(e.statusCode).toEqual(418);
        }
      });
      it('throws new error', async () => {
        // Only care about the size of the return, not the content
        const mockDB2 = jest.fn().mockImplementation(() => {
          return {
            getOngoingByStaffId: () => {
              return Promise.reject({
                message: 'Random error!'
              });
            }
          };
        });
        const svc = new OpenVisitService(new mockDB2());
        expect.assertions(1);
        try {
          await svc.checkOpenVisit('abc123');
        } catch (e) {
          expect(e.statusCode).toEqual(500);
        }
      });
    });
  });
});
