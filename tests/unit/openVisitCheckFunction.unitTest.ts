import { openVisitCheck } from '../../src/functions/openVisitCheck';
import { Context } from 'aws-lambda';
import OpenVisitService from '../../src/services/OpenVisitService';
import { HTTPRESPONSE } from '../../src/assets/enums';
import { HTTPResponse } from '../../src/utils/HTTPResponse';

describe('openVisitCheck Function', () => {
  // @ts-ignore
  const ctx: Context = null;
  describe('without query params', () => {
    it('return BAD REQUEST error', async () => {
      expect.assertions(2);

      const output: HTTPResponse = await openVisitCheck({}, ctx, () => {
        return;
      });
      expect(output.statusCode).toEqual(400);
      expect(output.body).toEqual(JSON.stringify(HTTPRESPONSE.MISSING_PARAMETERS));
    });
  });
  describe('without staffId query param', () => {
    it('return BAD REQUEST error', async () => {
      const event = {
        queryStringParameters: null
      };
      // const svcSpy = jest.spyOn(OpenVisitService.prototype, "checkOpenVisit").mockResolvedValue(true)
      expect.assertions(2);

      const output: HTTPResponse = await openVisitCheck(event, ctx, () => {
        return;
      });
      expect(output.statusCode).toEqual(400);
      expect(output.body).toEqual(JSON.stringify(HTTPRESPONSE.MISSING_PARAMETERS));
    });
  });
  describe('with staffId query param that is empty string', () => {
    it('return BAD REQUEST error', async () => {
      const event = {
        queryStringParameters: {
          testerStaffId: ' '
        }
      };
      expect.assertions(2);

      const output: HTTPResponse = await openVisitCheck(event, ctx, () => {
        return;
      });
      expect(output.statusCode).toEqual(400);
      expect(output.body).toEqual(JSON.stringify(HTTPRESPONSE.MISSING_PARAMETERS));
    });
  });
  describe('with staffId query param that is the string "undefined"', () => {
    it('return BAD REQUEST error', async () => {
      const event = {
        queryStringParameters: {
          testerStaffId: 'undefined'
        }
      };
      expect.assertions(2);

      const output: HTTPResponse = await openVisitCheck(event, ctx, () => {
        return;
      });
      expect(output.statusCode).toEqual(400);
      expect(output.body).toEqual(JSON.stringify(HTTPRESPONSE.MISSING_PARAMETERS));
    });
  });
  describe('with staffId query param that is the string "null"', () => {
    it('return BAD REQUEST error', async () => {
      const event = {
        queryStringParameters: {
          testerStaffId: 'null'
        }
      };
      expect.assertions(2);

      const output: HTTPResponse = await openVisitCheck(event, ctx, () => {
        return;
      });
      expect(output.statusCode).toEqual(400);
      expect(output.body).toEqual(JSON.stringify(HTTPRESPONSE.MISSING_PARAMETERS));
    });
  });
  describe('with staffId query param that is undefined', () => {
    it('return BAD REQUEST error', async () => {
      const event = {
        queryStringParameters: {
          testerStaffId: undefined
        }
      };
      expect.assertions(2);

      const output: HTTPResponse = await openVisitCheck(event, ctx, () => {
        return;
      });
      expect(output.statusCode).toEqual(400);
      expect(output.body).toEqual(JSON.stringify(HTTPRESPONSE.MISSING_PARAMETERS));
    });
  });
  describe('with staffId query param that is null', () => {
    it('return BAD REQUEST error', async () => {
      const event = {
        queryStringParameters: {
          testerStaffId: null
        }
      };
      expect.assertions(2);

      const output: HTTPResponse = await openVisitCheck(event, ctx, () => {
        return;
      });
      expect(output.statusCode).toEqual(400);
      expect(output.body).toEqual(JSON.stringify(HTTPRESPONSE.MISSING_PARAMETERS));
    });
  });
  describe('with staffId query param', () => {
    describe('and with a successful return from the Service call', () => {
      it('returns 200 and the data from the service call', async () => {
        const event = {
          queryStringParameters: {
            testerStaffId: 'anything'
          }
        };
        const svcSpy = jest
          .spyOn(OpenVisitService.prototype, 'checkOpenVisit')
          .mockResolvedValue(true);
        expect.assertions(2);

        const output: HTTPResponse = await openVisitCheck(event, ctx, () => {
          return;
        });
        expect(output.statusCode).toEqual(200);
        expect(output.body).toEqual(JSON.stringify(true));
      });
    });
    describe('and with a error returned from the Service call', () => {
      it('returns the error', async () => {
        const event = {
          queryStringParameters: {
            testerStaffId: 'anything'
          }
        };
        const svcSpy = jest
          .spyOn(OpenVisitService.prototype, 'checkOpenVisit')
          .mockRejectedValue(new HTTPResponse(418, 'Warning, Will Robinson!'));
        expect.assertions(2);

        const output: HTTPResponse = await openVisitCheck(event, ctx, () => {
          return;
        });
        expect(output.statusCode).toEqual(418);
        expect(output.body).toEqual(JSON.stringify('Warning, Will Robinson!'));
      });
    });
  });
});
