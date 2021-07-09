import { Handler } from 'aws-lambda';
import { HTTPResponse } from '../utils/HTTPResponse';
import { DynamoDBService } from '../services/DynamoDBService';
import OpenVisitService from '../services/OpenVisitService';
import { HTTPRESPONSE } from '../assets/enums';

const openVisitCheck: Handler = async (event: any): Promise<any> => {
  const staffID = event.queryStringParameters?.testerStaffId;

  if (!staffID) {
    return new HTTPResponse(400, HTTPRESPONSE.BAD_REQUEST);
  }

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
