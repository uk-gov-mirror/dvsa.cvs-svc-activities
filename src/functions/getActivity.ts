import { GetActivityService } from './../services/GetActivitiesService';
import { Context, Handler } from 'aws-lambda';
import { HTTPResponse } from '../utils/HTTPResponse';
import { DynamoDBService } from '../services/DynamoDBService';

const getActivity: Handler = async (event: any, context?: Context): Promise<any> => {
  const activityService = new GetActivityService(new DynamoDBService());
  return activityService
    .getActivities(event)
    .then((data: any) => {
      return new HTTPResponse(200, data);
    })
    .catch((error: HTTPResponse) => {
      return error;
    });
};

export { getActivity };
