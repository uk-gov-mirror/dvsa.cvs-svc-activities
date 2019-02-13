import * as Joi from "joi";

export const ActivitySchema = Joi.object().keys({
    activityType: Joi.any().only([ "visit", "wait" ]).required(),
    testStationName: Joi.string().required(),
    testStationPNumber: Joi.string().required(),
    testStationEmail: Joi.string().email().required(),
    testStationType: Joi.any().only([ "atf", "gvts", "hq" ]).required(),
    testerName: Joi.string().min(1).max(60).required(),
    testerStaffId: Joi.string().required(),
});
