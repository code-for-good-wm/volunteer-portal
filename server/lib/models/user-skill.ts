import { Schema, model, Types } from 'mongoose';
import { MongooseOpts } from './default-opts';
import { IUser } from './user';

export interface IUserSkill {
  _id?: Types.ObjectId,
  user: IUser['_id'],
  code: string,
  level: number
}

const userSkillSchema = new Schema({
  user: { type: Schema.Types.ObjectId, required: true, ref: 'User' },
  code: { type: String, required: true },
  level: { type: Number, required: true }
}, MongooseOpts);

export const UserSkillModel = model<IUserSkill>('UserSkill', userSkillSchema);