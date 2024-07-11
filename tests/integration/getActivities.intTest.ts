import { Configuration } from '../../src/utils/Configuration';
import supertest, { Response } from 'supertest';
import { ActivityType } from '@dvsa/cvs-type-definitions/types/v1/enums/activityType.enum';

const config: any = Configuration.getInstance().getConfig();
const request = supertest(`http://localhost:${config.serverless.port}`);
describe('GET /activities/details', () => {
  const queryEventParams = {
    fromStartTime: '2014-02-12',
    toStartTime: '2019-02-12',
    activityType: ActivityType.VISIT,
    testStationPNumber: '87-1369561',
    testerStaffId: '132'
  };
  context('when no parameters were passed', () => {
    it('should respond with HTTP 400', () => {
      return request
        .get('/activities/details')
        .expect('access-control-allow-origin', '*')
        .expect('access-control-allow-credentials', 'true')
        .expect(400);
    });
  });
  context('when all the parameters were passed', () => {
    it('should respond with HTTP 200', () => {
      return request
        .get(
          '/activities/details/?activityType=' +
            queryEventParams.activityType +
            '&fromStartTime=' +
            queryEventParams.fromStartTime +
            '&toStartTime=' +
            queryEventParams.toStartTime +
            '&testerStaffId=' +
            queryEventParams.testerStaffId +
            '&testStationPNumber=' +
            queryEventParams.testStationPNumber
        )
        .expect('access-control-allow-origin', '*')
        .expect('access-control-allow-credentials', 'true')
        .expect(200)
        .then((response: Response) => {
          expect(response.body).not.toHaveLength(0);
        });
    });
  });
  context('when the fromStartTime parameter was not passed', () => {
    it('should respond with HTTP 400', () => {
      return request
        .get(
          '/activities/details/?activityType=' +
            queryEventParams.activityType +
            '&toStartTime=' +
            queryEventParams.toStartTime +
            '&testerStaffId=' +
            queryEventParams.testerStaffId +
            '&testStationPNumber=' +
            queryEventParams.testStationPNumber
        )
        .expect('access-control-allow-origin', '*')
        .expect('access-control-allow-credentials', 'true')
        .expect(400);
    });
  });
  context('when all the parameters were passed', () => {
    context('but no data received from the database', () => {
      it('should respond with HTTP 404', () => {
        queryEventParams.fromStartTime = '2010-02-12';
        queryEventParams.toStartTime = '2011-02-12';
        return request
          .get(
            '/activities/details/?activityType=' +
              queryEventParams.activityType +
              '&fromStartTime=' +
              queryEventParams.fromStartTime +
              '&toStartTime=' +
              queryEventParams.toStartTime +
              '&testerStaffId=' +
              queryEventParams.testerStaffId +
              '&testStationPNumber=' +
              queryEventParams.testStationPNumber
          )
          .expect('access-control-allow-origin', '*')
          .expect('access-control-allow-credentials', 'true')
          .expect(404);
      });
    });
  });
});
