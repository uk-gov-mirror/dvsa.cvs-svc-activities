import * as Joi from "joi";
import { activitiesTypes, stationTypes, waitReasons } from "./Activity";
import { ActivityType } from "../assets/enums";

export const ActivitySchema = Joi.object().keys({
    parentId: Joi.string().optional(),
    activityType: Joi.any().only([ activitiesTypes ]).required(),
    testStationName: Joi.string().required(),
    testStationPNumber: Joi.string().required(),
    testStationEmail: Joi.string().email().required(),
    testStationType: Joi.any().only([ stationTypes ]).required(),
    testerName: Joi.string().min(1).max(60).required(),
    testerStaffId: Joi.string().required(),
    testerEmail: Joi.any().when("activityType", {
        is: ActivityType.VISIT,
        then:  Joi.string().email().required(),
        otherwise: Joi.any().forbidden(),
    }),
    startTime: Joi.string().optional(),
    endTime: Joi.string().optional().allow(null),
    waitReason: Joi.array().items([ waitReasons ]).optional(),
    notes: Joi.string().allow(null)
});
