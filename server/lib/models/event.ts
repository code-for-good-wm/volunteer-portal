import { Schema, model, Types } from 'mongoose';
import { MongooseOpts } from './default-opts';
import { EventType } from './enums/event-type.enum';
import { Status } from './enums/status.enum';

export interface IEvent {
  _id: Types.ObjectId,
  program: Types.ObjectId,
  name: string,
  description: string,
  startDate: Date, // ISO date with time zone
  endDate: Date, // ISO date with time zone
  location: string, // full address of event
  allowSignUps: boolean,
  allowPartialAttendance: boolean,
  eventType: EventType,
  status: Status
}

const eventSchema = new Schema<IEvent>({
  program: { type: Schema.Types.ObjectId, required: true, ref: 'Program' },
  name: { type: String, required: true },
  description: String,
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  location: String,
  allowSignUps: Boolean,
  allowPartialAttendance: Boolean,
  eventType: { type: String, enum: EventType, required: true },
  status: { type: String, enum: Status, required: true }
}, MongooseOpts);

export const EventModel = model<IEvent>('Event', eventSchema);