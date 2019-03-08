import {APIGatewayProxyResult, Context, Handler} from "aws-lambda";
import {Injector} from "../models/injector/Injector";
import {ActivityService} from "../services/ActivityService";
import {HTTPResponse} from "../utils/HTTPResponse";


const getActivity: Handler = async (event: any, context?: Context): Promise<any> => {
    const activityService = Injector.resolve<ActivityService>(ActivityService);
    return activityService.getActivity(event)
        .then((data: any) => {
            return new HTTPResponse(200, data);
        })
        .catch((error: HTTPResponse) => {
            return error;
        });
};

export { getActivity };
