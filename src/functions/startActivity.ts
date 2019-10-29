import {APIGatewayProxyResult, Context, Handler} from "aws-lambda";
import {ActivityService} from "../services/ActivityService";
import {HTTPResponse} from "../utils/HTTPResponse";
import {DynamoDBService} from "../services/DynamoDBService";


const startActivity: Handler = async (event: any, context?: Context): Promise<APIGatewayProxyResult> => {
    const activityService = new ActivityService(new DynamoDBService());

    return activityService.createActivity(event.body)
        .then((id: { id: string }) => {
            return new HTTPResponse(201, id);
        })
        .catch((error: HTTPResponse) => {
            console.log(error.body);
            return error;
        });
};

export { startActivity };
