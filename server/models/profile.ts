import { Schema, model, Types } from "mongoose";
import { MongooseOpts } from "./default-opts";
import { DietaryRestriction } from "./enums/dietary-restriction.enum";
import { Role } from "./enums/role.enum";
import { ShirtSize } from "./enums/shirt-size.enum";
import { User } from "./user";
import { UserSkill } from "./user-skill";

export interface Agreements {
  termsAndConditions?: string; // ISO date
  photoRelease?: string; // ISO date
  codeOfConduct?: string; // ISO date
}

export interface Profile {
  _id?: Types.ObjectId;
  user: Types.ObjectId | User;
  completionDate?: string; // ISO date; timestamp of initial profile completion
  roles: Role[];
  linkedInUrl?: string;
  websiteUrl?: string;
  portfolioUrl?: string;
  previousVolunteer?: boolean;
  shirtSize?: ShirtSize;
  dietaryRestrictions: DietaryRestriction[];
  accessibilityRequirements?: string;
  agreements?: Agreements;
  skills: Types.ObjectId[] | UserSkill[];
  additionalSkills?: string;
}

const profileSchema = new Schema<Profile>({
  user: { type: Types.ObjectId, required: true, ref: 'User' },
  completionDate: String,
  roles: [{ type: String, enum: Role }], // array of Role
  linkedInUrl: String,
  websiteUrl: String,
  portfolioUrl: String,
  previousVolunteer: Boolean,
  shirtSize: { type: String, enum: ShirtSize },
  dietaryRestrictions: [{ type: String, enum: DietaryRestriction }], // array of DietaryRestriction
  accessibilityRequirements: String,
  agreements: new Schema<Agreements>({
    termsAndConditions: String,
    photoRelease: String,
    codeOfConduct: String,
  }),
  skills: [{ type: Types.ObjectId, ref: 'UserSkill' }],
  additionalSkills: String
}, MongooseOpts);

export const ProfileModel = model<Profile>('Profile', profileSchema);