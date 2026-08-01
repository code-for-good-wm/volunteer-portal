import { Schema, model, Types } from 'mongoose';
import { MongooseOpts } from './default-opts';
import { Is501c3Status } from './enums/is-501c3-status.enum';
import { NonprofitStatus } from './enums/nonprofit-status.enum';

export interface INonprofit {
  _id?: Types.ObjectId;
  name: string;
  website?: string;
  description: string;
  city: string;
  state: string;
  is501c3: Is501c3Status;
  einNumber?: string;
  // PII: only surfaced to board/admin callers (see nonprofit/nonprofits handlers)
  contactName: string;
  contactRole: string;
  contactEmail: string;
  contactPhone: string;
  status: NonprofitStatus; // review status for this org, independent of any Project's status
  notes?: string; // internal staff notes
  createdDate?: string; // ISO date; set automatically by MongooseOpts timestamps, not a schema field
}

const nonprofitSchema = new Schema<INonprofit>(
  {
    name: { type: String, required: true },
    website: String,
    description: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    is501c3: { type: String, enum: Is501c3Status, required: true },
    einNumber: String,
    contactName: { type: String, required: true },
    contactRole: { type: String, required: true },
    contactEmail: { type: String, required: true },
    contactPhone: { type: String, required: true },
    status: { type: String, enum: NonprofitStatus, required: true },
    notes: String,
  },
  MongooseOpts,
);

export const NonprofitModel = model<INonprofit>('Nonprofit', nonprofitSchema);
