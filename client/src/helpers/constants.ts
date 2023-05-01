import { DesignSkillsData, DietaryRestrictionData, PrimaryProfileSection, Profile, RoleData, ShirtSizeData, Skill, SkillLevelData, TechnicalSkillsData } from '../types/profile';
import { User } from '../types/user';

export const testUserData: User = {
  _id: '76iatw8omMRPY5VmwIf9HqrlSTe2',
  name: '',
  email: 'test1@slothwerks.com',
  phone: '',
  userRole: 'volunteer'
};

export const testProfileData: Profile = {
  user: '76iatw8omMRPY5VmwIf9HqrlSTe2',
  completionDate: '',
  roles: [],
  linkedInUrl: '',
  websiteUrl: '',
  portfolioUrl: '',
  shirtSize: '',
  dietaryRestrictions: [],
  additionalDietaryRestrictions: '',
  accessibilityRequirements: '',
  skills: [],
  additionalSkills: '',
};

export const roles: RoleData[] = [
  {
    id: 'developer',
    description: 'Developer',
  },
  {
    id: 'designer',
    description: 'Designer',
  },
  {
    id: 'support',
    description: 'Supporting Role: Social Media, Copywriting, etc.',
    shortDescription: 'Support',
  },
  {
    id: 'lead',
    description: 'Project Manager and/or Team Lead',
    shortDescription: 'Team Lead',
  },
];

export const shirtSizes: ShirtSizeData[] = [
  {
    id: 'small',
    description: 'Small',
  },
  {
    id: 'medium',
    description: 'Medium',
  },
  {
    id: 'large',
    description: 'Large',
  },
  {
    id: 'xl',
    description: 'X-Large',
  },
  {
    id: 'xxl',
    description: 'XX-Large',
  },
];

export const dietaryRestrictions: DietaryRestrictionData[] = [
  {
    id: 'vegan',
    description: 'Vegan',
  },
  {
    id: 'vegetarian',
    description: 'Vegetarian',
  },
  {
    id: 'dairy',
    description: 'No Lactose / Dairy Free',
  },
  {
    id: 'gluten',
    description: 'No Gluten',
  },
  {
    id: 'kosher',
    description: 'Kosher',
  },
  {
    id: 'nuts',
    description: 'Nut Allergy',
  },
  {
    id: 'fish',
    description: 'Fish & Shellfish Allergy',
  },
  {
    id: 'eggs',
    description: 'Egg Allergy',
  },
  {
    id: 'other',
    description: 'Other',
  }
];

export const skillLevels: SkillLevelData[] = [
  {
    level: 0,
    description: 'None'
  },
  {
    level: 1,
    description: 'Newbie'
  },
  {
    level: 2,
    description: 'Familiar'
  },
  {
    level: 3,
    description: 'Very Familiar'
  },
  {
    level: 4,
    description: 'Daily Use'
  },
];

export const profileStructure: PrimaryProfileSection[] = [
  {
    id: 'getting-started',
    type: 'primary',
    description: 'Getting Started',
    sections: [
      {
        id: 'basic-information',
        type: 'secondary',
        description: 'Basic Information'
      },
      {
        id: 'accessibility',
        type: 'secondary',
        description: 'Accessibility'
      },
      {
        id: 'terms-and-conditions',
        type: 'secondary',
        description: 'Terms & Conditions'
      },
    ]
  },
  {
    id: 'technical-skills',
    type: 'primary',
    description: 'Technical Skills',
    sections: [
      // {
      //   id: 'experience-level',
      //   type: 'secondary',
      //   description: 'Experience Level'
      // },
      // {
      //   id: 'tools-and-languages',
      //   type: 'secondary',
      //   description: 'Tools & Languages'
      // },
    ]
  },
  {
    id: 'design-skills',
    type: 'primary',
    description: 'Design Skills',
    sections: [
      // {
      //   id: 'experience-level',
      //   type: 'secondary',
      //   description: 'Experience Level'
      // },
      // {
      //   id: 'tools',
      //   type: 'secondary',
      //   description: 'Tools'
      // },
      // {
      //   id: 'development',
      //   type: 'secondary',
      //   description: 'Development'
      // },
    ]
  },
  {
    id: 'additional-skills',
    type: 'primary',
    description: 'Additional Skills',
    sections: [
      // {
      //   id: 'other-experience',
      //   type: 'secondary',
      //   description: 'Other Experience'
      // },
      // {
      //   id: 'other-skills',
      //   type: 'secondary',
      //   description: 'Other Skills'
      // },
    ]
  },
];

export const technicalSkills: TechnicalSkillsData = {
  experienceLevel: [
    {
      code: 'frontEndDev',
      description: 'Front End Dev'
    },
    {
      code: 'backEndDev',
      description: 'Back End Dev'
    },
    {
      code: 'databases',
      description: 'Databases'
    },
    {
      code: 'mobileDev',
      description: 'Mobile Dev'
    },
    {
      code: 'devOps',
      description: 'DevOps'
    },
  ],
  toolsAndLanguages: [
    {
      code: 'wordPress',
      description: 'WordPress'
    },
    {
      code: 'squarespace',
      description: 'Squarespace'
    },
    {
      code: 'wix',
      description: 'Wix'
    },
    {
      code: 'weebly',
      description: 'Weebly'
    },
    {
      code: 'htmlCss',
      description: 'HTML / CSS'
    },
    {
      code: 'javaScript',
      description: 'JavaScript'
    },
    {
      code: 'react',
      description: 'React'
    },
    {
      code: 'vue',
      description: 'Vue'
    },
    {
      code: 'angular',
      description: 'Angular'
    },
    {
      code: 'nodeExpress',
      description: 'Node / Express'
    },
    {
      code: 'phpLaravel',
      description: 'PHP / Laravel'
    },
  ]
};

export const designSkills: DesignSkillsData = {
  experienceLevel: [
    {
      code: 'print',
      description: 'Print Design'
    },
    {
      code: 'ux',
      description: 'User Experience (UX)'
    },
    {
      code: 'ui',
      description: 'User Interface (UI)'
    },
    {
      code: 'designThinking',
      description: 'Design Thinking'
    },
    {
      code: 'illustration',
      description: 'Illustration'
    },
    {
      code: 'brand',
      description: 'Branding'
    },
    {
      code: 'motionGraphics',
      description: 'Motion Graphics'
    },
  ],
  tools: [
    {
      code: 'adobeSuite',
      description: 'Adobe Creative Suite'
    },
    {
      code: 'sketch',
      description: 'Sketch'
    },
    {
      code: 'figma',
      description: 'Figma'
    },
    {
      code: 'zeplin',
      description: 'Zeplin'
    },
    {
      code: 'inVision',
      description: 'InVision'
    },
    {
      code: 'marvel',
      description: 'Marvel'
    },
    {
      code: 'adobeXd',
      description: 'Adobe XD'
    },
  ],
  development: [
    {
      code: 'frontEndDev',
      description: 'Front End Dev'
    },
    {
      code: 'backEndDev',
      description: 'Back End Dev'
    },
    {
      code: 'databases',
      description: 'Databases'
    },
    {
      code: 'mobileDev',
      description: 'Mobile Dev'
    },
    {
      code: 'devOps',
      description: 'DevOps'
    },
  ],
};

export const otherExperience: Skill[] = [
  {
    code: 'projMgmt',
    description: 'Project Management'
  },
  {
    code: 'brand',
    description: 'Brand Strategy'
  },
  {
    code: 'copy',
    description: 'Copywriting'
  },
  {
    code: 'crm',
    description: 'CRM Tools (e.g. Salesforce)'
  },
  {
    code: 'marketing',
    description: 'Marketing'
  },
  {
    code: 'seo',
    description: 'SEO'
  },
  {
    code: 'social',
    description: 'Social Media'
  },
  {
    code: 'technicalWriting',
    description: 'Technical Writing'
  },
  {
    code: 'testing',
    description: 'User Testing / Compliance Testing'
  },
  {
    code: 'photography',
    description: 'Photography'
  },
  {
    code: 'videography',
    description: 'Videography'
  },
];

export const technicalSkillCodes = [...technicalSkills.experienceLevel, ...technicalSkills.toolsAndLanguages].map(s => s.code);

export const designSkillCodes = [...designSkills.experienceLevel, ...designSkills.tools].map(s => s.code);

export const otherSkillCodes = otherExperience.map(s => s.code);

export const agreementUrl = {
  termsAndConditions: 'https://codeforgoodwm.org/participant-agreement/',
  photoRelease: '',
  codeOfConduct: 'https://codeforgoodwm.org/code-of-conduct/',
};
