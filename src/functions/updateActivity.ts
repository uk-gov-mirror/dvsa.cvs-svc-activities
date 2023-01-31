import { Context, Handler } from 'aws-lambda';
import { ActivityService } from '../services/ActivityService';
import { HTTPResponse } from '../utils/HTTPResponse';
import { HTTPRESPONSE } from '../assets/enums';
import { DynamoDBService } from '../services/DynamoDBService';

const updateActivity: Handler = async (
  event: any,
  context: Context
): Promise<HTTPResponse> => {
  const activityService = new ActivityService(new DynamoDBService());
  // Is body valid: present, not empty, and an array
  if (
    !event.body ||
    event.body.length === 0 ||
    Object.keys(event.body).length === 0 ||
    !Array.isArray(event.body)
  ) {
    return new HTTPResponse(400, HTTPRESPONSE.BAD_REQUEST);
  }

  return activityService
    .updateActivity(event.body)
    .then(() => {
      return new HTTPResponse(204, HTTPRESPONSE.ACTIVITY_UPDATED);
    })
    .catch((error: HTTPResponse) => {
      console.log(error.body);
      return error;
    });
};

export { updateActivity };
