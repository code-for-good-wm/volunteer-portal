import { Schema, model, Types } from 'mongoose';
import { MongooseOpts } from './default-opts';
import { IProject } from './project';
import { Role } from './enums/role.enum';

export interface IPosition {
  _id?: Types.ObjectId;
  project: IProject['_id'];
  role: Role; // same vocabulary as Profile.roles
  slotCount: number;
  notes?: string; // shown to volunteers on their invitation
}

const positionSchema = new Schema<IPosition>(
  {
    project: { type: Schema.Types.ObjectId, required: true, ref: 'Project' },
    role: { type: String, enum: Role, required: true },
    slotCount: { type: Number, required: true },
    notes: String,
  },
  MongooseOpts,
);

export const PositionModel = model<IPosition>('Position', positionSchema);
