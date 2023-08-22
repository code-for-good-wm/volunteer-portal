export type PrimaryProfileSectionId = 'roles' | 'getting-started' | 'technical-skills' | 'design-skills' | 'additional-skills';

export type SecondaryProfileSectionId = 'basic-information' | 'accessibility' | 'terms-and-conditions' | 'experience-level' | 'tools-and-languages' | 'tools' | 'development' | 'other-experience' | 'other-skills';

export type Role = 'designer' | 'developer' | 'support' | 'lead';

export type ShirtSize = 'small' | 'medium' | 'large' | 'xl' | 'xxl' | '3xl' | '';

export type DietaryRestriction = 'vegan' | 'vegetarian' | 'dairy' | 'gluten' | 'kosher' | 'nuts' | 'fish' | 'eggs' | 'soy' | 'corn' | 'other';

export type Agreement = 'termsAndConditions' | 'photoRelease' | 'codeOfConduct';

export type SkillCode = 'frontEndDev' | 'backEndDev' | 'databases' | 'mobileDev' | 'devOps' | 'wordPress' | 'squarespace' | 'wix' | 'weebly' | 'htmlCss' | 'javaScript' | 'react' | 'vue' | 'angular' | 'nodeExpress' | 'phpLaravel' | 'projMgmt' | 'brand' | 'copy' | 'crm' | 'marketing' | 'seo' | 'social' | 'technicalWriting' | 'testing' | 'photography' | 'videography' | 'print' | 'ux' | 'ui' | 'designThinking' | 'illustration' | 'motionGraphics' | 'adobeSuite' | 'sketch' | 'figma' | 'zeplin' | 'inVision' | 'marvel' | 'adobeXd';

export type SkillLevel = 0 | 1 | 2 | 3 | 4;

export type UserSkillData = Partial<Record<SkillCode, SkillLevel>>;

export interface PrimaryProfileSection {
  id: PrimaryProfileSectionId;
  type: 'primary';
  description: string;
  sections?: SecondaryProfileSection[]
}

export interface SecondaryProfileSection {
  id: SecondaryProfileSectionId;
  type: 'secondary';
  description: string;
}

/**
 * Agreements are ISO date strings, e.g. '2022-05-19T20:47:46.021Z'
 */
export interface Agreements {
  termsAndConditions?: string;
  photoRelease?: string;
  codeOfConduct?: string;
}

export interface Skill {
  code: SkillCode; // e.g. 'frontEndDev'
  description: string; // e.g. 'Front End Development'
}

export interface UserSkill {
  _id?: string; // ID of user skill document in database
  code: SkillCode;
  level: SkillLevel;
}

export interface ProfileSkill {
  code: SkillCode;
  description: string;
  level: SkillLevel;
}

export interface Profile {
  user: string;
  completionDate?: string; // ISO date
  roles: Role[];
  linkedInUrl?: string;
  websiteUrl?: string;
  portfolioUrl?: string;
  previousVolunteer?: boolean;
  teamLeadCandidate?: boolean;
  shirtSize?: ShirtSize;
  dietaryRestrictions: DietaryRestriction[];
  additionalDietaryRestrictions: string;
  accessibilityRequirements?: string;
  agreements?: Agreements;
  skills: UserSkill[];
  additionalSkills?: string;
}

export interface ProfileUpdate {
  completionDate?: string; // ISO date
  roles?: Role[];
  linkedInUrl?: string;
  websiteUrl?: string;
  portfolioUrl?: string;
  previousVolunteer?: boolean;
  teamLeadCandidate?: boolean;
  shirtSize?: ShirtSize;
  dietaryRestrictions?: DietaryRestriction[];
  additionalDietaryRestrictions?: string;
  accessibilityRequirements?: string;
  agreements?: Agreements;
  skills?: UserSkill[];
  additionalSkills?: string;
}

export interface RoleData {
  id: Role;
  description: string;
  shortDescription?: string;
}

export interface ShirtSizeData {
  id: ShirtSize;
  description: string;
}

export interface DietaryRestrictionData {
  id: DietaryRestriction;
  description: string;
}

export interface SkillLevelData {
  level: SkillLevel;
  description: string;
}

export interface TechnicalSkillsData {
  experienceLevel: Skill[];
  toolsAndLanguages: Skill[];
}

export interface DesignSkillsData {
  experienceLevel: Skill[];
  tools: Skill[];
  development: Skill[];
}
