import { RoleData } from '../types/profile';
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
    agreements: [],
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
