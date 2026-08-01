import {
  DesignSkillsData,
  DietaryRestrictionData,
  PrimaryProfileSection,
  Profile,
  RoleData,
  ShirtSizeData,
  Skill,
  SkillLevelData,
  TechnicalSkillsData,
} from '../types/profile';
import { User } from '../types/user';

export const testUserData: User = {
  _id: '76iatw8omMRPY5VmwIf9HqrlSTe2',
  firstName: 'Sloth',
  lastName: 'I',
  email: 'test1@slothwerks.com',
  phone: '',
  userRole: 'volunteer',
};

export const testProfileData: Profile = {
  user: '76iatw8omMRPY5VmwIf9HqrlSTe2',
  completionDate: '',
  roles: [],
  linkedInUrl: '',
  websiteUrl: '',
  portfolioUrl: '',
  shirtSize: 'none',
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
    id: 'none',
    description: 'None',
  },
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
    id: '2xl',
    description: 'XX-Large',
  },
  {
    id: '3xl',
    description: '3X-Large',
  },
  {
    id: '4xl',
    description: '4X-Large',
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
  },
];

export const skillLevels: SkillLevelData[] = [
  {
    level: 0,
    description: 'None',
  },
  {
    level: 1,
    description: 'Newbie',
  },
  {
    level: 2,
    description: 'Familiar',
  },
  {
    level: 3,
    description: 'Very Familiar',
  },
  {
    level: 4,
    description: 'Daily Use',
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
        description: 'Basic Information',
      },
      {
        id: 'accessibility',
        type: 'secondary',
        description: 'Accessibility',
      },
      {
        id: 'terms-and-conditions',
        type: 'secondary',
        description: 'Terms & Conditions',
      },
    ],
  },
  {
    id: 'technical-skills',
    type: 'primary',
    description: 'Technical Skillset',
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
    ],
  },
  {
    id: 'design-skills',
    type: 'primary',
    description: 'Design Skillset',
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
    ],
  },
  {
    id: 'additional-skills',
    type: 'primary',
    description: 'Additional Skillset',
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
    ],
  },
];

export const technicalSkills: TechnicalSkillsData = {
  experienceLevel: [
    {
      code: 'frontEndDev',
      description: 'Front End Dev',
    },
    {
      code: 'backEndDev',
      description: 'Back End Dev',
    },
    {
      code: 'databases',
      description: 'Databases',
    },
    {
      code: 'mobileDev',
      description: 'Mobile Dev',
    },
    {
      code: 'devOps',
      description: 'DevOps',
    },
  ],
  toolsAndLanguages: [
    {
      code: 'wordPress',
      description: 'WordPress',
    },
    {
      code: 'squarespace',
      description: 'Squarespace',
    },
    {
      code: 'wix',
      description: 'Wix',
    },
    {
      code: 'htmlCss',
      description: 'HTML / CSS',
    },
    {
      code: 'javaScript',
      description: 'JavaScript',
    },
    {
      code: 'typeScript',
      description: 'TypeScript',
    },
    {
      code: 'react',
      description: 'React',
    },
    {
      code: 'vue',
      description: 'Vue',
    },
    {
      code: 'angular',
      description: 'Angular',
    },
    {
      code: 'nodeExpress',
      description: 'Node / Express',
    },
    {
      code: 'csharp',
      description: 'C#',
    },
    {
      code: 'java',
      description: 'Java',
    },
    {
      code: 'python',
      description: 'Python',
    },
    {
      code: 'rust',
      description: 'Rust',
    },
    {
      code: 'go',
      description: 'Go',
    },
    {
      code: 'phpLaravel',
      description: 'PHP / Laravel',
    },
  ],
};

export const designSkills: DesignSkillsData = {
  experienceLevel: [
    {
      code: 'print',
      description: 'Print Design',
    },
    {
      code: 'ux',
      description: 'User Experience (UX)',
    },
    {
      code: 'ui',
      description: 'User Interface (UI)',
    },
    {
      code: 'designThinking',
      description: 'Design Thinking',
    },
    {
      code: 'illustration',
      description: 'Illustration',
    },
    {
      code: 'brand',
      description: 'Branding',
    },
    {
      code: 'motionGraphics',
      description: 'Motion Graphics',
    },
  ],
  tools: [
    {
      code: 'adobeSuite',
      description: 'Adobe Creative Suite',
    },
    {
      code: 'canva',
      description: 'Canva',
    },
    {
      code: 'figma',
      description: 'Figma',
    },
    {
      code: 'zeplin',
      description: 'Zeplin',
    },
    {
      code: 'inVision',
      description: 'InVision',
    },
    {
      code: 'sketch',
      description: 'Sketch',
    },
  ],
  development: [
    {
      code: 'frontEndDev',
      description: 'Front End Dev',
    },
    {
      code: 'backEndDev',
      description: 'Back End Dev',
    },
    {
      code: 'databases',
      description: 'Databases',
    },
    {
      code: 'mobileDev',
      description: 'Mobile Dev',
    },
    {
      code: 'devOps',
      description: 'DevOps',
    },
  ],
};

export const otherExperience: Skill[] = [
  {
    code: 'aitools',
    description: 'AI/LLMs',
  },
  {
    code: 'agenticcode',
    description: 'Agentic Coding',
  },
  {
    code: 'cybersecurity',
    description: 'Cybersecurity',
  },
  {
    code: 'projMgmt',
    description: 'Project Management',
  },
  {
    code: 'brand',
    description: 'Brand Strategy',
  },
  {
    code: 'copy',
    description: 'Copywriting',
  },
  {
    code: 'crm',
    description: 'CRM Tools',
  },
  {
    code: 'salesforce',
    description: 'Salesforce',
  },
  {
    code: 'marketing',
    description: 'Marketing',
  },
  {
    code: 'seo',
    description: 'SEO',
  },
  {
    code: 'social',
    description: 'Social Media',
  },
  {
    code: 'technicalWriting',
    description: 'Technical Writing',
  },
  {
    code: 'testing',
    description: 'User Testing / Compliance Testing',
  },
  {
    code: 'accessibleDesign',
    description: 'Accessible Design',
  },
  {
    code: 'accessibleDevelopment',
    description: 'Accessible Development',
  },
  {
    code: 'assistiveTechnology',
    description: 'Assistive Technology',
  },
  {
    code: 'photography',
    description: 'Photography',
  },
  {
    code: 'videography',
    description: 'Videography',
  },
];

export const technicalSkillCodes = [
  ...technicalSkills.experienceLevel,
  ...technicalSkills.toolsAndLanguages,
].map((s) => s.code);

export const designSkillCodes = [
  ...designSkills.experienceLevel,
  ...designSkills.tools,
].map((s) => s.code);

export const otherSkillCodes = otherExperience.map((s) => s.code);

export const agreementUrl = {
  termsAndConditions: 'https://codeforgoodwm.org/participant-agreement/',
  photoRelease: '',
  codeOfConduct: 'https://codeforgoodwm.org/code-of-conduct/',
};

export const usStates = [
  'Alabama',
  'Alaska',
  'Arizona',
  'Arkansas',
  'California',
  'Colorado',
  'Connecticut',
  'Delaware',
  'Florida',
  'Georgia',
  'Hawaii',
  'Idaho',
  'Illinois',
  'Indiana',
  'Iowa',
  'Kansas',
  'Kentucky',
  'Louisiana',
  'Maine',
  'Maryland',
  'Massachusetts',
  'Michigan',
  'Minnesota',
  'Mississippi',
  'Missouri',
  'Montana',
  'Nebraska',
  'Nevada',
  'New Hampshire',
  'New Jersey',
  'New Mexico',
  'New York',
  'North Carolina',
  'North Dakota',
  'Ohio',
  'Oklahoma',
  'Oregon',
  'Pennsylvania',
  'Rhode Island',
  'South Carolina',
  'South Dakota',
  'Tennessee',
  'Texas',
  'Utah',
  'Vermont',
  'Virginia',
  'Washington',
  'West Virginia',
  'Wisconsin',
  'Wyoming',
];

export const is501c3StatusOptions: {
  id: 'yes' | 'no' | 'in-progress';
  label: string;
}[] = [
  { id: 'yes', label: 'Yes' },
  { id: 'no', label: 'No' },
  { id: 'in-progress', label: 'In progress' },
];

export const usStateAbbreviations: Record<string, string> = {
  Alabama: 'AL',
  Alaska: 'AK',
  Arizona: 'AZ',
  Arkansas: 'AR',
  California: 'CA',
  Colorado: 'CO',
  Connecticut: 'CT',
  Delaware: 'DE',
  Florida: 'FL',
  Georgia: 'GA',
  Hawaii: 'HI',
  Idaho: 'ID',
  Illinois: 'IL',
  Indiana: 'IN',
  Iowa: 'IA',
  Kansas: 'KS',
  Kentucky: 'KY',
  Louisiana: 'LA',
  Maine: 'ME',
  Maryland: 'MD',
  Massachusetts: 'MA',
  Michigan: 'MI',
  Minnesota: 'MN',
  Mississippi: 'MS',
  Missouri: 'MO',
  Montana: 'MT',
  Nebraska: 'NE',
  Nevada: 'NV',
  'New Hampshire': 'NH',
  'New Jersey': 'NJ',
  'New Mexico': 'NM',
  'New York': 'NY',
  'North Carolina': 'NC',
  'North Dakota': 'ND',
  Ohio: 'OH',
  Oklahoma: 'OK',
  Oregon: 'OR',
  Pennsylvania: 'PA',
  'Rhode Island': 'RI',
  'South Carolina': 'SC',
  'South Dakota': 'SD',
  Tennessee: 'TN',
  Texas: 'TX',
  Utah: 'UT',
  Vermont: 'VT',
  Virginia: 'VA',
  Washington: 'WA',
  'West Virginia': 'WV',
  Wisconsin: 'WI',
  Wyoming: 'WY',
};
