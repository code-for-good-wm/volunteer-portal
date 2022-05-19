import { Role, ShirtSize, DietaryRestriction, Agreements, UserSkill } from './profile';

export interface User {
  id: string; // Pulled from Firebase Auth
  name: string;
  email: string;
  phone: string; // Ten numerical digits
  roles: Role[];
  linkedInUrl: string;
  websiteUrl: string;
  portfolioUrl: string;
  previousVolunteer?: boolean; // Likely we will remove this later
  shirtSize: ShirtSize;
  dietaryRestrictions: DietaryRestriction[];
  accessibilityRequirements: string;
  agreements: Agreements[];
  skills: UserSkill[];
  additionalSkills: string;
}
