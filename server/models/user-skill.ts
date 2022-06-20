import { Schema, model, Types } from "mongoose";
import { MongooseOpts } from "./default-opts";
import { User } from "./user";

export interface UserSkill {
  _id?: Types.ObjectId,
  user: Types.ObjectId | User,
  code: string,
  level: number
}

export const UserSkillModel = model<UserSkill>('UserSkill', new Schema({
  userId: { type: Types.ObjectId, required: true },
  code: { type: String, required: true },
  level: { type: Number, required: true }
}, MongooseOpts));