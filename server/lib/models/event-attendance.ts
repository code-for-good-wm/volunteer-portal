import { Schema, model, Types } from 'mongoose';
import { MongooseOpts } from './default-opts';
import { Attendance } from './enums/attendance.enum';
import { Role } from './enums/role.enum';
import { Allocation } from './enums/allocation.enum';

export interface IEventAttendance {
  _id?: Types.ObjectId,
  user: Types.ObjectId,
  event: Types.ObjectId,
  attendance: Attendance,
  attendanceDetail: string,
  roles: Role[];
  allocation: Allocation
}

const eventAttendanceSchema = new Schema({
  user: { type: Schema.Types.ObjectId, required: true, ref: 'User' },
  event: { type: Schema.Types.ObjectId, required: true, ref: 'Event' },
  attendance: { type: String, enum: Attendance },
  attendanceDetail: String,
  roles: [{ type: String, enum: Role }], // array of Role
  allocation: { type: String, enum: Allocation }
}, MongooseOpts);

export const EventAttendanceModel = model<IEventAttendance>('EventAttendance', eventAttendanceSchema);