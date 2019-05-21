import {APIGatewayProxyResult, Context, Handler} from "aws-lambda";
import {Injector} from "../models/injector/Injector";
import {ActivityService} from "../services/ActivityService";
import {HTTPResponse} from "../utils/HTTPResponse";
import {HTTPRESPONSE} from "../assets/enums";

const updateActivity: Handler = async (event: any, context: Context): Promise<APIGatewayProxyResult> => {
    const activityService = Injector.resolve<ActivityService>(ActivityService);

    return activityService.updateActivity(event.body)
        .then(() => {
            return new HTTPResponse(204, HTTPRESPONSE.ACTIVITY_UPDATED);
        })
        .catch((error: HTTPResponse) => {
            console.log(error.body);
            return error;
        });
};

export { updateActivity };
