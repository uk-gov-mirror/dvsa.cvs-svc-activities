import { IActivity } from '../../src/models/Activity';
import { ActivityType, StationType } from '../../src/assets/enums';
import { Configuration } from '../../src/utils/Configuration';
import supertest, { Response } from 'supertest';
import { ActivityService } from '../../src/services/ActivityService';
import { DynamoDBService } from '../../src/services/DynamoDBService';
let postedActivity: any = {};

describe('POST /activities', () => {
  const config: any = Configuration.getInstance().getConfig();
  const request = supertest(`http://localhost:${config.serverless.port}`);
  const visitId: string = '5e4bd304-446e-4678-8289-d34fca9256e8'; // existing-parentId
  context('when a new activity is started', () => {
    context('and the payload is malformed', () => {
      const payload: any = {
        activityType: ActivityType.VISIT,
        badAttr: 'badValue',
        testStationPNumber: '87-1369569',
        testStationEmail: 'malformed',
        testStationType: StationType.GVTS,
        testerName: 'Gica'
      };

      it('should respond with HTTP 400', () => {
        return request
          .post('/activities')
          .send(payload)
          .expect('access-control-allow-origin', '*')
          .expect('access-control-allow-credentials', 'true')
          .expect(400);
      });
    });

    context('and the payload is correct for visit activityType', () => {
      const payload: IActivity = {
        activityType: ActivityType.VISIT,
        testStationName: 'Rowe, Wunsch and Wisoky',
        testStationPNumber: '87-1369569',
        testStationEmail: 'teststationname@dvsa.gov.uk',
        testStationType: StationType.GVTS,
        testerName: 'Dorel',
        testerStaffId: '1664',
        testerEmail: 'tester@dvsa.gov.uk'
      };

      it('should respond with HTTP 201', () => {
        return request
          .post('/activities')
          .send(payload)
          .expect('access-control-allow-origin', '*')
          .expect('access-control-allow-credentials', 'true')
          .expect(201)
          .then((response: Response) => {
            expect(response.body).toHaveProperty('id');
            expect(response.body.id).toMatch(
              /[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}/
            );

            postedActivity = { id: response.body.id };
            console.log(`Creating visit: ${postedActivity.id}`);
          });
      });
    });

    context('and the payload is correct for wait activityType', () => {
      const payload: IActivity = {
        parentId: visitId,
        activityType: ActivityType.WAIT,
        testStationName: 'Rowe, Wunsch and Wisoky',
        testStationPNumber: '87-1369569',
        testStationEmail: 'teststationname@dvsa.gov.uk',
        testStationType: StationType.GVTS,
        testerName: 'Dorel',
        testerStaffId: '1664',
        startTime: new Date().toISOString(),
        endTime: new Date().toISOString(),
        waitReason: ['Break'],
        notes: 'test notes'
      };

      it('should respond with HTTP 201', () => {
        return request
          .post('/activities')
          .send(payload)
          .expect('access-control-allow-origin', '*')
          .expect('access-control-allow-credentials', 'true')
          .expect(201)
          .then((response: Response) => {
            expect(response.body).toHaveProperty('id');
            expect(response.body.id).toMatch(
              /[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}/
            );
          });
      });
    });
  });
});

/**
 * End Activities (PUT) tests
 */
// endActivity tests put here instead of separate as they use variables from the tests created above which are difficult to get access to otherwise.

describe('PUT /activities/:id/end', () => {
  const activityService: ActivityService = new ActivityService(new DynamoDBService());
  const config: any = Configuration.getInstance().getConfig();
  const request = supertest(`http://localhost:${config.serverless.port}`);

  context('when a non-existing activity is ended', () => {
    it('should respond with HTTP 404', () => {
      return request
        .put(`/activities/bad_id/end`)
        .send({})
        .expect('access-control-allow-origin', '*')
        .expect('access-control-allow-credentials', 'true')
        .expect(404);
    });
  });

  context('when an activity is not already ended', () => {
    it('should respond with HTTP 200 (wasVisitAlreadyClosed = false)', () => {
      return request
        .put(`/activities/${postedActivity.id}/end`)
        .expect('access-control-allow-origin', '*')
        .expect('access-control-allow-credentials', 'true')
        .expect(200, {
          wasVisitAlreadyClosed: false
        });
    });
  });

  context('when an activity is already ended', () => {
    it('should respond with HTTP 200 (wasVisitAlreadyClosed = true)', () => {
      return request
        .put(`/activities/${postedActivity.id}/end`)
        .expect('access-control-allow-origin', '*')
        .expect('access-control-allow-credentials', 'true')
        .expect(200, {
          wasVisitAlreadyClosed: true
        });
    });
  });

  afterAll(async () => {
    return await activityService.dbClient.delete(postedActivity);
  });
});
