import { Schema, model, Types } from 'mongoose';
import { MongooseOpts } from './default-opts';
import { INonprofit } from './nonprofit';
import { IEvent } from './event';
import { ProjectStatus } from './enums/project-status.enum';
import { OnsiteContactAvailability } from './enums/onsite-contact-availability.enum';
import { BrandAssetsStatus } from './enums/brand-assets-status.enum';

export interface IProject {
  _id?: Types.ObjectId;
  nonprofit: INonprofit['_id'];
  event?: IEvent['_id']; // set once the project is accepted and assigned to an event
  name: string;
  description: string;
  problem: string; // what's painful today
  successCriteria: string;
  whoUsesIt: string;
  existingSystem: string;
  timeline: string;
  status: ProjectStatus;
  onsiteContactAvailability: OnsiteContactAvailability;
  onsiteContactName?: string;
  brandAssets: BrandAssetsStatus;
  notes?: string;
  reference?: string; // tracking id for public form submissions
  submittedAt?: Date;
  createdDate?: Date; // set automatically by MongooseOpts timestamps, not a schema field
  updatedDate?: Date; // set automatically by MongooseOpts timestamps, not a schema field
}

const projectSchema = new Schema<IProject>(
  {
    nonprofit: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: 'Nonprofit',
    },
    event: { type: Schema.Types.ObjectId, ref: 'Event' },
    name: { type: String, required: true },
    description: { type: String, required: true },
    problem: { type: String, required: true },
    successCriteria: String,
    whoUsesIt: String,
    existingSystem: String,
    timeline: String,
    status: { type: String, enum: ProjectStatus, required: true },
    onsiteContactAvailability: {
      type: String,
      enum: OnsiteContactAvailability,
    },
    onsiteContactName: String,
    brandAssets: { type: String, enum: BrandAssetsStatus },
    notes: String,
    reference: String,
    submittedAt: Date,
  },
  MongooseOpts,
);

export const ProjectModel = model<IProject>('Project', projectSchema);
