import { store } from '../store/store';
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

/**
 * Determine the next profile view to display based on the current view
 * Returns the ID of the next section to display (e.g. 'technical-skills'),
 * or a boolean value: false if we can't perform the operation, true if the
 * current section is the final section to complete
 * @returns {PrimaryProfileSectionId | boolean}
 */
export const getNextProfileSection = () => {
  const appState = store.getState();

  // Get current section
  const currentSection = appState.profile.currentSection;
  if (!currentSection) {
    return false;
  }

  // Get user roles
  const userData = appState.auth.user;
  const userRoles = userData?.profile?.roles ?? [];

  // Get expected profile sections to display
  const displayedSections = getDisplayedProfileSections(userRoles);

  // Get index of current section
  const currentSectionIndex = displayedSections.findIndex((section) => {
    return (section === currentSection);
  });

  if (currentSectionIndex < 0) {
    return false;
  }

  const nextSection = displayedSections[currentSectionIndex + 1];

  if (!nextSection) {
    return true;
  }

  return nextSection;
};
