import { APIGatewayProxyResult, Context, Handler } from 'aws-lambda';
import { ActivityService } from '../services/ActivityService';
import { HTTPResponse } from '../utils/HTTPResponse';
import { DynamoDBService } from '../services/DynamoDBService';
import { HTTPRESPONSE } from '../assets/enums';
import { Validator } from '../utils/Validator';

const endActivity: Handler = async (
  event: any,
  context: Context
): Promise<APIGatewayProxyResult> => {
  const activityService = new ActivityService(new DynamoDBService());
  const check: Validator = new Validator();
  const id: string = event.pathParameters.id;

  if (!check.parameterIsValid(id)) {
    return new HTTPResponse(400, HTTPRESPONSE.BAD_REQUEST);
  }

  return activityService
    .endActivity(id)
    .then((wasVisitAlreadyClosed) => {
      return new HTTPResponse(200, wasVisitAlreadyClosed);
    })
    .catch((error: HTTPResponse) => {
      console.log(error.body);
      return error;
    });
};

export { endActivity };
