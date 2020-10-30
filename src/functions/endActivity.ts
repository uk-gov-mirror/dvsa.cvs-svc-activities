import {APIGatewayProxyResult, Context, Handler} from "aws-lambda";
import {ActivityService} from "../services/ActivityService";
import {HTTPResponse} from "../utils/HTTPResponse";
import {DynamoDBService} from "../services/DynamoDBService";

const endActivity: Handler = async (event: any, context: Context): Promise<APIGatewayProxyResult> => {
    const activityService = new ActivityService(new DynamoDBService());
    const id: string = event.pathParameters.id;

    return activityService.endActivity(id)
        .then((wasVisitAlreadyClosed) => {
            return new HTTPResponse(200, wasVisitAlreadyClosed);
        })
        .catch((error: HTTPResponse) => {
            console.log(error.body);
            return error;
        });
};

export { endActivity };
