import * as Joi from "joi";
import { activitiesTypes, stationTypes, waitReasons } from "./Activity";

export const ActivitySchema = Joi.object().keys({
    parentId: Joi.string().optional(),
    activityType: Joi.any().only([ activitiesTypes ]).required(),
    testStationName: Joi.string().required(),
    testStationPNumber: Joi.string().required(),
    testStationEmail: Joi.string().email().required(),
    testStationType: Joi.any().only([ stationTypes ]).required(),
    testerName: Joi.string().min(1).max(60).required(),
    testerStaffId: Joi.string().required(),
    startTime: Joi.string().optional(),
    endTime: Joi.string().optional(),
    waitReason: Joi.array().items([ waitReasons ]).optional(),
    notes: Joi.string().allow(null)
});
