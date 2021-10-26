import AWS from 'aws-sdk';
import { DocumentClient } from 'aws-sdk/lib/dynamodb/document_client';
import { DynamoDBService } from '../../src/services/DynamoDBService';
import { IActivityParams } from '../../src/models/Activity';

describe('DynamoDBService', () => {
  context('Query activities', () => {
    context('builds correct request for QUERY', () => {
      beforeEach(() => {
        jest.resetModules();
      });
      // Mock once
      let stub: any = null;
      AWS.DynamoDB.DocumentClient.prototype.query = jest
        .fn()
        .mockImplementation((params: DocumentClient.QueryInput) => {
          return {
            promise: () => {
              stub = params;
              return Promise.resolve([]);
            }
          };
        });

      it('for getOngoingByStaffId', async () => {
        const expectedCall = {
          TableName: 'cvs-local-activities',
          IndexName: 'StaffIndex',
          KeyConditionExpression: 'testerStaffId = :staffId',
          FilterExpression: 'attribute_type(endTime, :NULL)',
          ExpressionAttributeValues: {
            ':staffId': '1234',
            ':NULL': 'NULL'
          }
        };
        const dynamoDbService = new DynamoDBService();
        await dynamoDbService.getOngoingByStaffId('1234');
        expect(stub).toStrictEqual(expectedCall);
      });

      it('for getActivities with optional params', async () => {
        const expectedCall = {
          TableName: 'cvs-local-activities',
          IndexName: 'ActivityTypeIndex',
          KeyConditionExpression:
            'activityType = :activityType AND startTime BETWEEN :fromStartTime AND :toStartTime',
          FilterExpression: 'testStationPNumber = :testStationPNumber',
          ExpressionAttributeValues: {
            ':activityType': 'visit',
            ':fromStartTime': '2021-01-01',
            ':toStartTime': '2021-01-01',
            ':testStationPNumber': 'abc123'
          }
        };
        const dynamoDbService = new DynamoDBService();
        const params: IActivityParams = {
          fromStartTime: '2021-01-01',
          toStartTime: '2021-01-01',
          activityType: 'visit',
          testStationPNumber: 'abc123'
        };
        await dynamoDbService.getActivities(params);

        expect(stub).toStrictEqual(expectedCall);
      });

      it('for getActivities without optional params', async () => {
        const expectedCall = {
          TableName: 'cvs-local-activities',
          IndexName: 'ActivityTypeIndex',
          KeyConditionExpression:
            'activityType = :activityType AND startTime BETWEEN :fromStartTime AND :toStartTime',
          ExpressionAttributeValues: {
            ':activityType': 'visit',
            ':fromStartTime': '2021-01-01',
            ':toStartTime': '2021-01-01'
          }
        };
        const dynamoDbService = new DynamoDBService();
        const params: IActivityParams = {
          fromStartTime: '2021-01-01',
          toStartTime: '2021-01-01',
          activityType: 'visit'
        };
        await dynamoDbService.getActivities(params);

        expect(stub).toStrictEqual(expectedCall);
      });
    });
  });
  context('builds correct request for GET', () => {
    beforeEach(() => {
      jest.resetModules();
    });
    // Mock once
    let stub: any = null;
    AWS.DynamoDB.DocumentClient.prototype.get = jest
      .fn()
      .mockImplementation((params: DocumentClient.Get) => {
        return {
          promise: () => {
            stub = params;
            return Promise.resolve([]);
          }
        };
      });

    it('for get', async () => {
      const expectedCall = {
        TableName: 'cvs-local-activities',
        Key: {
          id: '1234'
        }
      };
      const dynamoDbService = new DynamoDBService();
      await dynamoDbService.get({ id: '1234' });

      expect(stub).toStrictEqual(expectedCall);
    });
  });

  context('Update activities', () => {
    beforeEach(() => {
      jest.resetModules();
    });
    // Mock once
    let stub: any = null;
    AWS.DynamoDB.DocumentClient.prototype.put = jest
      .fn()
      .mockImplementation((params: DocumentClient.Put) => {
        return {
          promise: () => {
            stub = params;
            return Promise.resolve([]);
          }
        };
      });
    context('builds correct request when the activity updated', () => {
      it('should return the correct query', async () => {
        const activity = {
          mockActivity: '123'
        };
        const expectedCall = {
          TableName: 'cvs-local-activities',
          Item: activity,
          ReturnValues: 'ALL_OLD'
        };

        const dynamoDbService = new DynamoDBService();
        await dynamoDbService.put(activity);
        expect(stub).toStrictEqual(expectedCall);
      });
    });
  });
});
