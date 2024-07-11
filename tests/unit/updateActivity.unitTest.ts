import { ActivityService } from '../../src/services/ActivityService';
import { HTTPResponse } from '../../src/utils/HTTPResponse';
import { HTTPRESPONSE } from '../../src/assets/enums';
import { DynamoDBService } from '../../src/services/DynamoDBService';
import { WaitReason } from '@dvsa/cvs-type-definitions/types/v1/enums/waitReason.enum';

describe('Activity Service - update Activity path', () => {
  const activityId: string = '9e4b9304-446e-4678-8289-d34fca9259e4'; // Existing ID
  context('when the payload is malformed', () => {
    const payload: any = [{ id: activityId, notes: 'sample' }];
    it('should return an error', () => {
      const activityService = new ActivityService(new DynamoDBService());

      expect.assertions(1);
      return activityService.updateActivity(payload).catch((error: HTTPResponse) => {
        const body: any = JSON.parse(error.body);
        expect(body.error).toEqual('"waitReason" is required');
      });
    });
  });

  context('when the activity does not exist', () => {
    const payload: any = [
      { id: 'non-existing-id', waitReason: [WaitReason.OTHER, WaitReason.WAITING_FOR_VEHICLE], notes: 'sample' }
    ];
    it('should return an error', () => {
      DynamoDBService.prototype.get = jest.fn().mockResolvedValue({});
      const activityService = new ActivityService(new DynamoDBService());
      expect.assertions(1);
      return activityService.updateActivity(payload).catch((error: HTTPResponse) => {
        const body: any = JSON.parse(error.body);
        expect(body.error).toEqual(`${HTTPRESPONSE.NOT_EXIST}`);
      });
    });
  });

  context('when the activity was successfully updated', () => {
    const payload: any = [{ id: 'waitId', waitReason: [WaitReason.WAITING_FOR_VEHICLE], notes: 'sample' }];
    it('should return void', async () => {
      DynamoDBService.prototype.get = jest.fn().mockResolvedValue({ Item: { test: true } });
      DynamoDBService.prototype.batchPut = jest
        .fn()
        .mockResolvedValue({ id: '00000000-0000-0000-0000-000000000000' });
      const activityService = new ActivityService(new DynamoDBService());
      // If the call does not throw errors, it is successful
      expect.assertions(0);
      return activityService.updateActivity(payload).catch((error: HTTPResponse) => {
        expect(error).toBeFalsy();
      });
    });
  });

  context('when the waitReason does not meet the requirements', () => {
    const payload: any = [
      { id: activityId, waitReason: ['invalidReason', WaitReason.WAITING_FOR_VEHICLE], notes: null }
    ];
    it('should return an error', async () => {
      const activityService = new ActivityService(new DynamoDBService());

      expect.assertions(1);
      return activityService.updateActivity(payload).catch((error: HTTPResponse) => {
        const body: any = JSON.parse(error.body);
        expect(body.error).toEqual(
          `"waitReason[0]" must be one of [${WaitReason.WAITING_FOR_VEHICLE}, ${WaitReason.BREAK}, ${WaitReason.ADMIN}, ${WaitReason.SITE_ISSUE}, ${WaitReason.OTHER}]`
        );
      });
    });
  });
});
