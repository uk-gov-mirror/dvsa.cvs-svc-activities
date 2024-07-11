import Joi from 'joi';
import { WaitReason } from '@dvsa/cvs-type-definitions/types/v1/enums/waitReason.enum';

export const ActivityUpdated = Joi.object().keys({
  id: Joi.string().required(),
  waitReason: Joi.array().items(Joi.string().valid(...Object.values(WaitReason))).required(),
  notes: Joi.string().allow(null)
});
