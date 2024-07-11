import Joi from 'joi';
import { ActivityType } from '@dvsa/cvs-type-definitions/types/v1/enums/activityType.enum';
import { WaitReason } from '@dvsa/cvs-type-definitions/types/v1/enums/waitReason.enum';
import { TestStationTypes } from '@dvsa/cvs-type-definitions/types/v1/enums/testStationType.enum';

export const ActivityCreated = Joi.object().keys({
  parentId: Joi.string().optional(),
  activityType: Joi.string().valid(...Object.values(ActivityType)).required(),
  testStationName: Joi.string().required(),
  testStationPNumber: Joi.string().required(),
  testStationEmail: Joi.string().email().required().allow(''),
  testStationType: Joi.string().valid(...Object.values(TestStationTypes)).required(),
  testerName: Joi.string().min(1).max(60).required(),
  testerStaffId: Joi.string().required(),
  testerEmail: Joi.any().when('activityType', {
    is: ActivityType.VISIT,
    then: Joi.string().email().required(),
    otherwise: Joi.any().forbidden()
  }),
  startTime: Joi.string().optional(),
  endTime: Joi.string().optional().allow(null),
  waitReason: Joi.array().items(Joi.string().valid(...Object.values(WaitReason))).optional(),
  notes: Joi.string().allow(null)
});
