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
  roles: Role[];
  preferredName?: string;
  pronouns?: string;
  linkedInUrl?: string;
  websiteUrl?: string;
  portfolioUrl?: string;
  currentEmployer?: string; // Sponsorship opportunity
  previousVolunteer?: boolean;
  teamLeadCandidate?:boolean;
  shirtSize?: ShirtSize;
  dietaryRestrictions: DietaryRestriction[];
  additionalDietaryRestrictions?: string;
  accessibilityRequirements?: string;
  agreements?: IAgreements;
  skills: Types.DocumentArray<IUserSkill>;
  additionalSkills?: string;
  completionDate?: string; // ISO date; timestamp of initial profile completion
  updatedDate?: string; // ISO date; timestamp of last profile update
}

const profileSchema = new Schema<IProfile>({
  user: { type: Schema.Types.ObjectId, required: true, ref: 'User' },
  roles: [{ type: String, enum: Role }], // array of Role
  preferredName: String,
  pronouns: String,
  linkedInUrl: String,
  websiteUrl: String,
  portfolioUrl: String,
  currentEmployer: String,
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
  additionalSkills: String,
  completionDate: String
}, MongooseOpts);

export const ProfileModel = model<IProfile>('Profile', profileSchema);
