import {APIGatewayProxyResult, Context, Handler} from "aws-lambda";
import {Injector} from "../models/injector/Injector";
import {ActivityService} from "../services/ActivityService";
import {HTTPResponse} from "../utils/HTTPResponse";

const endActivity: Handler = async (event: any, context: Context): Promise<APIGatewayProxyResult> => {
    const activityService = Injector.resolve<ActivityService>(ActivityService);
    const id: string = event.pathParameters.id;

    return activityService.endActivity(id)
        .then(() => {
            return new HTTPResponse(204, "");
        })
        .catch((error: HTTPResponse) => {
            console.log(error.body);
            return error;
        });
};

export { endActivity };
