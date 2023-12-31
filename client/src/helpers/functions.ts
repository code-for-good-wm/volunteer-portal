import { NavigateFunction } from 'react-router-dom';
import { getAuth } from 'firebase/auth';

import { updateAlert } from '../store/alertSlice';
import { updateAuth } from '../store/authSlice';
import { updateProfile } from '../store/profileSlice';
import { store } from '../store/store';
import { PrimaryProfileSectionId, SkillCode, UserSkill, UserSkillData } from '../types/profile';
import { profileStructure } from './constants';

/**
 * Capitalize first letter of a string
 * @param {string} string - e.g. 'consumer'
 * @returns {string} - e.g. 'Consumer'
 */
export const capitalizeFirstLetter = (string: string) => {
  return string.charAt(0).toUpperCase() + string.slice(1);
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

/** Get the base URL for the backend API */
export function getApiBaseUrl(): string {
  return `${import.meta.env.VITE_AZURE_CLOUD_FUNCTION_BASE_URL || ''}/api`;
}

/** Get a valid auth token */
export async function getAuthToken(): Promise<string> {
  const auth = getAuth();
  const fbUser = auth.currentUser;
  return await fbUser?.getIdToken() || '';
}

/**
 * Create default request headers object with the provided auth token
 * @param token The auth token to send to the server, treated as a Bearer token
 */
export function getDefaultRequestHeaders(token: string): Record<string, string> {
  return {
    'Content-Type': 'application/json',
    'x-firebase-auth': `Bearer ${token}`
  };
}

/**
 * Reset state to defaults
 */
export const resetAppState = () => {
  store.dispatch(
    updateAuth({
      signedIn: false,
      updating: false,
      user: null,
    })
  );

  store.dispatch(
    updateProfile({
      currentSection: null,
      data: null,
      showRegistrationComplete: false,
    })
  );

  store.dispatch(
    updateAlert({
      visible: false
    })
  );
};

/**
 * Determine profile sections to display based on user roles
 * @returns {PrimaryProfileSectionId[]} - e.g. ['getting-started', 'technical-skills', 'additional-skills'];
 */
export const getDisplayedProfileSections = () => {
  const appState = store.getState();

  const roles = appState.profile.data?.roles;
  const sectionsToDisplay: PrimaryProfileSectionId[] = ['getting-started'];

  if (roles) {
    if (roles.includes('developer')) {
      sectionsToDisplay.push('technical-skills');
    }
    if (roles.includes('designer')) {
      sectionsToDisplay.push('design-skills');
    }
  }

  sectionsToDisplay.push('additional-skills');

  return sectionsToDisplay;
};

/**
 * Determine the next profile view to display based on the current view
 * Returns the ID of the next section to display (e.g. 'technical-skills'),
 * or a boolean value: false if we can't perform the operation, true if the
 * current section is the final section to complete
 * @returns {PrimaryProfileSectionId | boolean}
 */
export const getNextProfileSectionId = () => {
  const appState = store.getState();

  // Get current section
  const currentSection = appState.profile.currentSection;
  if (!currentSection) {
    return false;
  }

  // Get expected profile sections to display
  const displayedSections = getDisplayedProfileSections();

  // Get index of current section
  const currentSectionIndex = displayedSections.findIndex((section) => {
    return (section === currentSection);
  });

  if (currentSectionIndex < 0) {
    return false;
  }

  const nextSectionId = displayedSections[currentSectionIndex + 1];

  if (!nextSectionId) {
    return true;
  }

  return nextSectionId;
};

/**
 * Determine the ID of the previous profile view based on the current view
 * Returns the ID of the next section to display (e.g. 'design-skills'),
 * or undefined if a previous section cannot be determined
 * @returns {PrimaryProfileSection | undefined}
 */
export const getPreviousProfileSection = () => {
  const appState = store.getState();

  // Get current section
  const currentSection = appState.profile.currentSection;
  if (!currentSection) {
    return;
  }

  // Get expected profile sections to display
  const displayedSections = getDisplayedProfileSections();

  // Get index of current section
  const currentSectionIndex = displayedSections.findIndex((section) => {
    return (section === currentSection);
  });

  if (currentSectionIndex < 0) {
    return;
  }

  const prevSectionId = displayedSections[currentSectionIndex - 1];

  if (!prevSectionId) {
    return;
  }

  const sectionData = profileStructure.find((section) => {
    return (section.id === prevSectionId);
  });

  return sectionData;
};

/**
 * Navigate to next profile section
 * Determines next section based on user roles
 * @param {NavigateFunction} navigate
 */
export const navigateToNextProfileSection = (navigate: NavigateFunction) => {
  // Determine next view to display
  const nextSection = getNextProfileSectionId() ?? '';
  if (!nextSection || nextSection === true) {
    // If next section cannot be determined or does not exist,
    // navigate to completion screen
    navigate('/profile/complete');
  } else {
    navigate(`/profile/${nextSection}`);
  }
};

/**
 * Convert an array of user skill data to an object
 * @param {UserSkill[]} skillData
 * @returns {UserSkillData}
 */
export const convertSkillDataToObject = (skillData: UserSkill[]) => {
  const initialData: UserSkillData = {};

  const obj = skillData.reduce((prev, current) => {
    const { code, level } = current;
    const update = { ...prev };
    update[code] = level;
    return update;
  }, initialData);

  return obj;
};

/**
 * Convert an object of user skill data to an array
 * @param {UserSkillData} skillData
 * @returns {UserSkill[]}
 */
export const convertSkillDataToArray = (skillData: UserSkillData) => {
  const entries = Object.entries(skillData); // example: [ 'nameOfCode', '0' ]

  const arr: UserSkill[] = entries.map((entry) => {
    const code = entry[0] as SkillCode;
    const level = entry[1];

    return { code, level };
  });

  return arr;
};

/**
 * Pull the user's saved profile and return an object with
 * data organized for the 'getting started' view
 */
export const getGettingStartedProfileData = () => {
  const appState = store.getState();
  const { user } = appState.auth;
  const profile = appState.profile.data;

  // If no data, return undefined
  if (!user || !profile) {
    return;
  }

  // Pull profile and return data
  const { name, phone } = user;
  const {
    linkedInUrl,
    websiteUrl,
    portfolioUrl,
    previousVolunteer,
    teamLeadCandidate,
    shirtSize,
    dietaryRestrictions,
    additionalDietaryRestrictions,
    accessibilityRequirements,
    agreements
  } = profile;

  return (
    {
      basicInfo: {
        name,
        phone: parsePhone(phone).formatted,
      },
      contactInfo: {
        linkedInUrl: linkedInUrl ?? '',
        websiteUrl: websiteUrl ?? '',
        portfolioUrl: portfolioUrl ?? '',
      },
      extraStuff: {
        previousVolunteer: !!previousVolunteer, // Could be undefined
        teamLeadCandidate: !!teamLeadCandidate,  // Could be undefined
        shirtSize: shirtSize ?? '',
        dietaryRestrictions,
        additionalDietaryRestrictions: additionalDietaryRestrictions ?? '',
      },
      accessibilityRequirements: accessibilityRequirements ?? '',
      agreements: {
        termsAndConditions: !!agreements?.termsAndConditions, // Convert to boolean
        photoRelease: !!agreements?.photoRelease, // Convert to boolean
        codeOfConduct: !!agreements?.codeOfConduct, // Convert to boolean
      }
    }
  );
};

/**
 * Pull the user's saved profile and return the user's skills array
 */
export const getUserSkills = () => {
  const appState = store.getState();
  const profile = appState.profile.data;
  return profile?.skills;
};

/**
 * Determine if this user is a developer based on their roles
 */
export const isUserDev = () => {
  const appState = store.getState();
  const profile = appState.profile.data;
  return profile?.roles.includes('developer');
};

/**
 * Pull the user's saved profile and return the profile's
 * additionalSkills (a string)
 */
export const getAdditionalSkills = () => {
  const appState = store.getState();
  const profile = appState.profile.data;
  return profile?.additionalSkills;
};

/**
 * Returns the string as title case e.g. A Title String
 */
export const toTitleCase = (str: string) => {
  if (!str || str.length === 0) { return ''; }
  return str.toLowerCase().split(' ').map(function(word) {
    return (word.charAt(0).toUpperCase() + word.slice(1));
  }).join(' ');
};