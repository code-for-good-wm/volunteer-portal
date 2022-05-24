export type Role = 'designer' | 'developer' | 'support' | 'lead';

export type ShirtSize = 'small' | 'medium' | 'large' | 'xl' | 'xxl' | '';

export type DietaryRestriction = 'vegan' | 'vegetarian' | 'dairy' | 'gluten' | 'kosher' | 'nuts' | 'fish' | 'eggs'; // Soy? Corn?

export type SkillCode = 'frontEndDev' | 'backEndDev' | 'databases' | 'mobileDev' | 'devOps' | 'wordPress' | 'squarespace' | 'wix' | 'weebly' | 'htmlCss' | 'javaScript' | 'react' | 'vue' | 'angular' | 'nodeExpress' | 'phpLaravel' | 'projMgmt' | 'brand' | 'copy' | 'crm' | 'marketing' | 'seo' | 'social' | 'technicalWriting' | 'testing' | 'photography' | 'videography' | 'print' | 'ux' | 'ui' | 'designThinking' | 'illustration' | 'motionGraphics' | 'adobeSuite' | 'sketch' | 'figma' | 'zeplin' | 'invision' | 'marvel' | 'adobeXd' | 'deployment';

/**
 * Agreements are ISO date strings, e.g. '2022-05-19T20:47:46.021Z'
 */
export interface Agreements {
  termsAndConditions: string;
  photoRelease: string;
  codeOfConduct: string;
}

export interface Skill {
  code: SkillCode; // e.g. 'frontEndDev'
  description: string; // e.g. 'Front End Development'
}

export interface UserSkill {
  code: SkillCode;
  level: 0 | 1 | 2 | 3 | 4;
}
