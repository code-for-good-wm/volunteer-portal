import { PrimaryProfileSectionId, Role } from '../types/profile';

/**
 * Capitalize first letter of a string
 * @param {string} string - e.g. 'consumer'
 * @returns {string} - e.g. 'Consumer'
 */
export const capitalizeFirstLetter = (string: string) => {
  return string.charAt(0).toUpperCase() + string.slice(1);
};

/**
 * Determine profile sections to display based on user roles
 * @param {Role[]} roles - e.g. ['developer', 'lead'];
 * @returns {PrimaryProfileSectionId[]} - e.g. ['getting-started', 'technical-skills', 'additional-skills'];
 */
export const getDisplayedProfileSections = (roles: Role[]) => {
  const sectionsToDisplay: PrimaryProfileSectionId[] = ['getting-started'];
  if (roles.includes('developer')) {
    sectionsToDisplay.push('roles', 'technical-skills');
  }
  if (roles.includes('designer')) {
    sectionsToDisplay.push('design-skills');
  }
  sectionsToDisplay.push('additional-skills');
  return sectionsToDisplay;
};
