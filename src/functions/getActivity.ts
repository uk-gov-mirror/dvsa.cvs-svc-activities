import { GetActivityService } from './../services/GetActivitiesService';
import { Context } from 'aws-lambda';
import { HTTPResponse } from '../utils/HTTPResponse';
import { DynamoDBService } from '../services/DynamoDBService';
import { HTTPRESPONSE } from '../assets/enums';

export async function getActivity(event: any, context?: Context): Promise<HTTPResponse> {
  if (!(event && event.queryStringParameters)) {
    return new HTTPResponse(400, HTTPRESPONSE.BAD_REQUEST);
  }

  const activityService = new GetActivityService(new DynamoDBService());
  const { fromStartTime, toStartTime, activityType, testStationPNumber, testerStaffId } =
    event.queryStringParameters && event.queryStringParameters;

  return activityService.getActivities({
    fromStartTime,
    toStartTime,
    activityType,
    testStationPNumber,
    testerStaffId
  })
  .then((data: any) => {
    return new HTTPResponse(200, data);
  })
  .catch((error: HTTPResponse) => {
    return error;
  });
}
