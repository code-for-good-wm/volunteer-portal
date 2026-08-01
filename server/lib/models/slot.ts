import { Schema, model, Types } from 'mongoose';
import { MongooseOpts } from './default-opts';
import { IPosition } from './position';
import { IUser } from './user';
import { SlotStatus } from './enums/slot-status.enum';

export interface ISlot {
  _id?: Types.ObjectId,
  position: IPosition['_id'],
  user?: IUser['_id'], // unset until a volunteer is invited
  status: SlotStatus,
  invitedAt?: Date,
  respondedAt?: Date,
  partialDetail?: string,
  declineReason?: string
}

const slotSchema = new Schema<ISlot>({
  position: { type: Schema.Types.ObjectId, required: true, ref: 'Position' },
  user: { type: Schema.Types.ObjectId, ref: 'User' },
  status: { type: String, enum: SlotStatus, required: true },
  invitedAt: Date,
  respondedAt: Date,
  partialDetail: String,
  declineReason: String
}, MongooseOpts);

export const SlotModel = model<ISlot>('Slot', slotSchema);
