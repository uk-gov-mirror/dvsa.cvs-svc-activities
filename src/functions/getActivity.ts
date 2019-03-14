import { GetActivityService } from "./../services/GetActivitiesService";
import { Context, Handler } from "aws-lambda";
import { Injector } from "../models/injector/Injector";
import { HTTPResponse } from "../utils/HTTPResponse";


const getActivity: Handler = async (event: any, context?: Context): Promise<any> => {
    const activityService = Injector.resolve<GetActivityService>(GetActivityService);
    return activityService.getActivities(event)
        .then((data: any) => {
            return new HTTPResponse(200, data);
        })
        .catch((error: HTTPResponse) => {
            return error;
        });
};

export { getActivity };
