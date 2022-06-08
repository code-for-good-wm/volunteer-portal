import { Schema, model, Types } from "mongoose";
import { MongooseOpts } from "./default-opts";

export interface User {
  _id?: Types.ObjectId,
  ident: string, // can be username or email depending on auth provider
  authProvider: string, // track the auth provider in case of conflicts
  name: string,
  email: string,
  emailValidated?: boolean
}

export const UserModel = model<User>('User', new Schema({
  _id: Types.ObjectId,
  ident: { type: String, required: true },
  authProvider: { type: String, required: true },
  name: { type: String, required: true },
  email: { type: String, required: true },
  emailValidated: Boolean
}, MongooseOpts));