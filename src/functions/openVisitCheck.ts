import { Handler } from 'aws-lambda';
import { HTTPResponse } from '../utils/HTTPResponse';
import { DynamoDBService } from '../services/DynamoDBService';
import OpenVisitService from '../services/OpenVisitService';
import { HTTPRESPONSE } from '../assets/enums';
import { Validator } from '../utils/Validator';

const openVisitCheck: Handler = async (event: any): Promise<HTTPResponse> => {
  const check: Validator = new Validator();

  if (event.queryStringParameters) {
    if (!check.parametersAreValid(event.queryStringParameters)) {
      return Promise.resolve(new HTTPResponse(400, HTTPRESPONSE.MISSING_PARAMETERS));
    }
  } else {
    return Promise.resolve(new HTTPResponse(400, HTTPRESPONSE.MISSING_PARAMETERS));
  }
  const staffID = event.queryStringParameters.testerStaffId;
  const openVisitService = new OpenVisitService(new DynamoDBService());
  return openVisitService
    .checkOpenVisit(staffID)
    .then((data: any) => {
      return new HTTPResponse(200, data);
    })
    .catch((error: HTTPResponse) => {
      return error;
    });
};

export { openVisitCheck };
