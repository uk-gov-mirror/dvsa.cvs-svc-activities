import { GetActivityService } from './../services/GetActivitiesService';
import { Context } from 'aws-lambda';
import { HTTPResponse } from '../utils/HTTPResponse';
import { DynamoDBService } from '../services/DynamoDBService';
import { HTTPRESPONSE } from '../assets/enums';

export async function getActivity(event: any, context?: Context): Promise<any> {
  if (!(event && event.queryStringParameters)) {
    return new HTTPResponse(400, HTTPRESPONSE.BAD_REQUEST);
  }

  const activityService = new GetActivityService(new DynamoDBService());
  const { fromStartTime, toStartTime, activityType, testStationPNumber, testerStaffId } =
    event.queryStringParameters && event.queryStringParameters;
  try {
    const data = await activityService.getActivities({
      fromStartTime,
      toStartTime,
      activityType,
      testStationPNumber,
      testerStaffId
    });
    return new HTTPResponse(200, data);
  } catch (error) {
    return error;
  }
}
