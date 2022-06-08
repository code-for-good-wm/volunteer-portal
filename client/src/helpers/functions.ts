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
    sectionsToDisplay.push('technical-skills');
  }
  if (roles.includes('designer')) {
    sectionsToDisplay.push('design-skills');
  }
  sectionsToDisplay.push('additional-skills');
  return sectionsToDisplay;
};

/**
 * Parse phone
 * Takes in a string and returns an object with a numerical and formatted phone
 * @param {string} phone
 * @returns {Phone}
 */
export const parsePhone = (phone: string) => {
  // Filter string to just numbers
  let number = phone.replace(/\D/g, '');
  if (number.length > 10) {
    number = number.substring(0, 10);
  }
  // Build formatted phone
  let formatted = '';
  if (number.length <= 3) {
    formatted = number;
  } else if (number.length > 3 && number.length <= 6) {
    formatted = `(${number.substring(0, 3)}) ${number.substring(3)}`;
  } else if (number.length > 6) {
    formatted = `(${number.substring(0, 3)}) ${number.substring(
      3,
      6
    )}-${number.substring(6, 10)}`;
  }
  return {
    number,
    formatted,
  };
};
