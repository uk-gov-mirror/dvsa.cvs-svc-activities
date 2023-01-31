import { GetActivityService } from './../services/GetActivitiesService';
import { Context, Handler } from 'aws-lambda';
import { HTTPResponse } from '../utils/HTTPResponse';
import { DynamoDBService } from '../services/DynamoDBService';
import { HTTPRESPONSE } from '../assets/enums';

const getActivitiesForCleanup: Handler = async (
  event: any,
  context?: Context
): Promise<HTTPResponse> => {
  if (!(event && event.queryStringParameters)) {
    return new HTTPResponse(400, HTTPRESPONSE.BAD_REQUEST);
  }

  const activityService = new GetActivityService(new DynamoDBService());

  // isOpen boolean is used to determine if there is no endTime on the activity
  const { fromStartTime, toStartTime, activityType, isOpen, testerStaffId } = event.queryStringParameters;
  return activityService.getActivities({
    fromStartTime,
    toStartTime,
    activityType,
    isOpen,
    testerStaffId
  })
  .then((data: any) => {
    return new HTTPResponse(200, data);
  })
  .catch((error: HTTPResponse) => {
    return error;
  });
};

export { getActivitiesForCleanup };
