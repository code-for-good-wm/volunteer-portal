import { Schema, model, Types } from 'mongoose';
import { MongooseOpts } from './default-opts';
import { IEvent } from './event';

export interface IProgram {
  _id?: Types.ObjectId,
  name: string,
  description: string,
  imageUrl: string,
  events: Types.Array<IEvent['_id']>
}

const programSchema = new Schema<IProgram>({
  name: { type: String, required: true },
  description: { type: String, required: true },
  imageUrl: String,
  events: [{ type: Schema.Types.ObjectId, ref: 'Event' }]
}, MongooseOpts);

export const ProgramModel = model<IProgram>('Program', programSchema);