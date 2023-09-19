import { GetActivityService } from '../../src/services/GetActivitiesService';
import { DynamoDBMockService } from '../models/DynamoDBMockService';
import { HTTPResponse } from '../../src/utils/HTTPResponse';
import * as jsonData from '../resources/activities.json';
import { IActivity } from '../../src/models/Activity';
import { HTTPRESPONSE } from '../../src/assets/enums';

describe('getActivities', () => {
  const dbMock = new DynamoDBMockService();
  // @ts-ignore
  const getActivityService: GetActivityService = new GetActivityService(dbMock);
  beforeEach(() => {
    jest.resetAllMocks();
    dbMock.seed([]);
  });
  context('when no data is returned from database', () => {
    it('should throw error', () => {
      const params = {
        fromStartTime: '2020-02-12',
        toStartTime: '2020-02-12',
        activityType: 'visit'
      };
      expect.assertions(2);

      return getActivityService.getActivities(params).catch((error: HTTPResponse) => {
        const body: any = JSON.parse(error.body);
        expect(error.statusCode).toEqual(404);
        expect(JSON.parse(body)).toEqual('No resources match the search criteria');
      });
    });
  });
  context('when the parameters are valid', () => {
    it('should return array of activities', async () => {
      dbMock.seed(Array.of(jsonData[0]) as IActivity[]);
      const params = {
        fromStartTime: '2018-02-13T04:00:40.561Z',
        toStartTime: '2018-02-13T04:00:40.561Z',
        activityType: 'visit'
      };
      expect(await getActivityService.getActivities(params)).not.toHaveLength(0);
    });
  });
  context('when the parameters are valid - isOpen true', () => {
    it('should return array of activities with activity 1 first', async () => {
      const mockData: IActivity[] = [];
      mockData.push(jsonData[0] as IActivity);
      mockData.push(jsonData[1] as IActivity);

      dbMock.seed(mockData as IActivity[]);
      const params = {
        fromStartTime: '2018-02-13T04:00:40.561Z',
        toStartTime: '2018-02-13T04:00:40.561Z',
        activityType: 'visit',
        isOpen: true
      };
      expect(await getActivityService.getActivities(params)).not.toHaveLength(0);
    });
    it('should return array of activities with activity 2 first', async () => {
      const mockData: IActivity[] = [];
      mockData.push(jsonData[1] as IActivity);
      mockData.push(jsonData[0] as IActivity);

      dbMock.seed(mockData as IActivity[]);
      const params = {
        fromStartTime: '2018-02-13T04:00:40.561Z',
        toStartTime: '2018-02-13T04:00:40.561Z',
        activityType: 'visit',
        isOpen: true
      };
      expect(await getActivityService.getActivities(params)).not.toHaveLength(0);
    });
    it('should return array of activities with no change in order', async () => {
      const mockData: IActivity[] = [];
      mockData.push(jsonData[0] as IActivity);
      mockData.push(jsonData[0] as IActivity);

      dbMock.seed(mockData as IActivity[]);
      const params = {
        fromStartTime: '2018-02-13T04:00:40.561Z',
        toStartTime: '2018-02-13T04:00:40.561Z',
        activityType: 'visit',
        isOpen: true
      };
      expect(await getActivityService.getActivities(params)).not.toHaveLength(0);
    });
  });
  context('when parameters are invalid - isOpen true', () => {
    it('should throw 400', () => {
      const params = {
        fromStartTime: '2020-02-12',
        toStartTime: '2020-02-12',
        isOpen: true
      };
      expect.assertions(2);

      return getActivityService.getActivities(params).catch((error: HTTPResponse) => {
        const body: any = JSON.parse(error.body);
        expect(error.statusCode).toEqual(400);
        expect(JSON.parse(body)).toEqual(HTTPRESPONSE.BAD_REQUEST);
      });
    });
  });
  context('when parameters are invalid - isOpen true', () => {
    it('should throw 400', () => {
      const params = {
        fromStartTime: '2020-02-12',
        toStartTime: '2020-02-12'
      };
      expect.assertions(2);

      return getActivityService.getActivities(params).catch((error: HTTPResponse) => {
        const body: any = JSON.parse(error.body);
        expect(error.statusCode).toEqual(400);
        expect(JSON.parse(body)).toEqual(HTTPRESPONSE.BAD_REQUEST);
      });
    });
  });
});
