import { PrimaryProfileSection, RoleData } from '../types/profile';
import { User } from '../types/user';

export const testUserData: User = {
  id: '76iatw8omMRPY5VmwIf9HqrlSTe2',
  name: '',
  email: 'test1@slothwerks.com',
  phone: '',
  profile: {
    currentSection: '',
    lastUpdate: '',
    completionDate: '',
    roles: [],
    linkedInUrl: '',
    websiteUrl: '',
    portfolioUrl: '',
    shirtSize: '',
    dietaryRestrictions: [],
    accessibilityRequirements: '',
    skills: [],
    additionalSkills: '',
  }
};

export const roles: RoleData[] = [
  {
    id: 'designer',
    description: 'Designer',
  },
  {
    id: 'developer',
    description: 'Developer',
  },
  {
    id: 'support',
    description: 'Supporting Role: Social Media, Copywriting, etc.',
  },
  {
    id: 'lead',
    description: 'Project Manager and/or Team Lead',
  },
];

export const profileStructure: PrimaryProfileSection[] = [
  // {
  //   id: 'roles',
  //   type: 'primary',
  //   description: 'Roles',
  //   sections: []
  // },
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
