import { Schema, model, Types } from 'mongoose';
import { MongooseOpts } from './default-opts';
import { UserRole } from './enums/user-role.enum';

export interface IUser {
  _id?: Types.ObjectId,
  ident: string, // unique identifier for user from auth provider
  authProvider: string, // track the auth provider in case of conflicts
  name: string,
  email: string,
  phone: string,
  emailValidated?: boolean
  userRole: UserRole
}

export const UserModel = model<IUser>('User', new Schema({
  ident: { type: String, required: true },
  authProvider: { type: String, required: true },
  name: String,
  email: { type: String, required: true },
  phone: String,
  emailValidated: Boolean,
  userRole: { type: String, required: true }
}, MongooseOpts));