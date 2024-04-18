import { DynamoDBService } from '../../src/services/DynamoDBService';
import { IActivityParams } from '../../src/models/Activity';
import { DynamoDBDocumentClient, GetCommand, PutCommand, QueryCommand } from '@aws-sdk/lib-dynamodb';
import { mockClient } from 'aws-sdk-client-mock';

describe('DynamoDBService', () => {
  context('Query activities', () => {
    context('builds correct request for QUERY', () => {
      beforeEach(() => {
        jest.resetModules();
      });      

      it('for getOngoingByStaffId', async () => {
        const mockDynamoClient = mockClient(DynamoDBDocumentClient);
        mockDynamoClient.on(QueryCommand).resolves({});
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

        const getStub = mockDynamoClient.commandCalls(QueryCommand);
        expect(getStub[0].args[0].input).toStrictEqual(expectedCall);
      });

      it('for getActivities with optional params', async () => {
        const mockDynamoClient = mockClient(DynamoDBDocumentClient);
        mockDynamoClient.on(QueryCommand).resolves({});
        const expectedCall = {
          TableName: 'cvs-local-activities',
          IndexName: 'ActivityTypeIndex',
          KeyConditionExpression:
            'activityType = :activityType AND startTime BETWEEN :fromStartTime AND :toStartTime',
          FilterExpression:
            'testStationPNumber = :testStationPNumber AND testerStaffId = :testerStaffId',
          ExpressionAttributeValues: {
            ':activityType': 'visit',
            ':fromStartTime': '2021-01-01',
            ':toStartTime': '2021-01-01',
            ':testStationPNumber': 'abc123',
            ':testerStaffId': 'test123'
          }
        };
        const dynamoDbService = new DynamoDBService();
        const params: IActivityParams = {
          fromStartTime: '2021-01-01',
          toStartTime: '2021-01-01',
          activityType: 'visit',
          testStationPNumber: 'abc123',
          testerStaffId: 'test123'
        };
        await dynamoDbService.getActivities(params);

        const stub = mockDynamoClient.commandCalls(QueryCommand);
        expect(stub[0].args[0].input).toStrictEqual(expectedCall);
      });

      it('for getActivities without optional params', async () => {
        const mockDynamoClient = mockClient(DynamoDBDocumentClient);
        mockDynamoClient.on(QueryCommand).resolves({});
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

        const stub = mockDynamoClient.commandCalls(QueryCommand);
        expect(stub[0].args[0].input).toStrictEqual(expectedCall);
      });

      it('for get openVisit activities', async () => {
        const mockDynamoClient = mockClient(DynamoDBDocumentClient);
        mockDynamoClient.on(QueryCommand).resolves({});
        const expectedCall = {
          TableName: 'cvs-local-activities',
          IndexName: 'ActivityTypeIndex',
          KeyConditionExpression: 'activityType = :activityType AND startTime >= :fromStartTime',
          ExpressionAttributeValues: {
            ':NULL': 'NULL',
            ':activityType': 'visit',
            ':fromStartTime': new Date(2020, 0, 1).toISOString()
          },
          FilterExpression: 'attribute_type(endTime, :NULL)'
        };
        const dynamoDbService = new DynamoDBService();
        const params: any = {
          isOpen: true,
          activityType: 'visit'
        };
        await dynamoDbService.getActivities(params);

        const stub = mockDynamoClient.commandCalls(QueryCommand);
        expect(stub[0].args[0].input).toStrictEqual(expectedCall);
      });
    });
  });
  context('builds correct request for GET', () => {
    beforeEach(() => {
      jest.resetModules();
    });

    it('for get', async () => {
      const mockDynamoClient = mockClient(DynamoDBDocumentClient);
      mockDynamoClient.on(GetCommand).resolves({});
      const expectedCall = {
        TableName: 'cvs-local-activities',
        Key: {
          id: '1234'
        }
      };
      const dynamoDbService = new DynamoDBService();
      await dynamoDbService.get({ id: '1234' });
      const stub = mockDynamoClient.commandCalls(GetCommand);
      expect(stub[0].args[0].input).toStrictEqual(expectedCall);
    });
  });

  context('Update activities', () => {
    beforeEach(() => {
      jest.resetModules();
    });
    context('builds correct request when the activity updated', () => {
      it('should return the correct query', async () => {
        const mockDynamoClient = mockClient(DynamoDBDocumentClient);
        mockDynamoClient.on(PutCommand).resolves({});
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
        const stub = mockDynamoClient.commandCalls(PutCommand);
        expect(stub[0].args[0].input).toStrictEqual(expectedCall);
      });
    });
  });
});
