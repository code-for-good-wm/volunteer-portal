import { Schema, model, Types } from 'mongoose';
import { MongooseOpts } from './default-opts';

export interface SkillOption {
  _id?: Types.ObjectId;
  code: string;
  description: string;
  category: string;
}

const skillOptionSchema = new Schema(
  {
    code: { type: String, required: true },
    description: { type: String, required: true },
    category: { type: String, required: true },
  },
  MongooseOpts,
);

export const SkillOptionModel = model<SkillOption>(
  'SkillOption',
  skillOptionSchema,
);
