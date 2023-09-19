import { Schema, model, Types } from 'mongoose';
import { MongooseOpts } from './default-opts';
import { DietaryRestriction } from './enums/dietary-restriction.enum';
import { Role } from './enums/role.enum';
import { ShirtSize } from './enums/shirt-size.enum';
import { IUser } from './user';
import { IUserSkill } from './user-skill';

export interface IAgreements {
  termsAndConditions?: string; // ISO date
  photoRelease?: string; // ISO date
  codeOfConduct?: string; // ISO date
}

export interface IProfile {
  _id?: Types.ObjectId;
  user: IUser['_id'];
  completionDate?: string; // ISO date; timestamp of initial profile completion
  roles: Role[];
  linkedInUrl?: string;
  websiteUrl?: string;
  portfolioUrl?: string;
  previousVolunteer?: boolean;
  teamLeadCandidate?:boolean;
  shirtSize?: ShirtSize;
  dietaryRestrictions: DietaryRestriction[];
  additionalDietaryRestrictions?: string;
  accessibilityRequirements?: string;
  agreements?: IAgreements;
  skills: Types.DocumentArray<IUserSkill>;
  additionalSkills?: string;
}

const profileSchema = new Schema<IProfile>({
  user: { type: Schema.Types.ObjectId, required: true, ref: 'User' },
  completionDate: String,
  roles: [{ type: String, enum: Role }], // array of Role
  linkedInUrl: String,
  websiteUrl: String,
  portfolioUrl: String,
  previousVolunteer: Boolean,
  teamLeadCandidate: Boolean,
  shirtSize: { type: String, enum: ShirtSize },
  dietaryRestrictions: [{ type: String, enum: DietaryRestriction }], // array of DietaryRestriction
  additionalDietaryRestrictions: String,
  accessibilityRequirements: String,
  agreements: new Schema<IAgreements>({
    termsAndConditions: String,
    photoRelease: String,
    codeOfConduct: String,
  }),
  skills: [{ type: Schema.Types.ObjectId, ref: 'UserSkill' }],
  additionalSkills: String
}, MongooseOpts);

export const ProfileModel = model<IProfile>('Profile', profileSchema);