import {APIGatewayProxyResult, Context, Handler} from "aws-lambda";
import {Injector} from "../models/injector/Injector";
import {ActivityService} from "../services/ActivityService";
import {HTTPResponse} from "../utils/HTTPResponse";

const startActivity: Handler = async (event: any, context?: Context): Promise<APIGatewayProxyResult> => {
    const activityService = Injector.resolve<ActivityService>(ActivityService);

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
