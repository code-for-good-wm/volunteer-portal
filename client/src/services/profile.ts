import { store } from '../store/store';

import { convertSkillDataToArray, convertSkillDataToObject, parsePhone } from '../helpers/functions';
import { Profile, UserSkill, UserSkillData } from '../types/profile';
import { updateProfile } from '../store/profileSlice';

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
    shirtSize,
    dietaryRestrictions,
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
        shirtSize: shirtSize ?? '',
        dietaryRestrictions,
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
 * Update the users' skills settings based on an array of skill data
 */
export const updateUserSkills = (update?: UserSkill[]) => {
  if (!update) {
    return;
  }

  const appState = store.getState();
  const profile = appState.profile.data;

  if (!profile) {
    return;
  }

  // Pull current skill data
  const currentSkills = profile.skills;

  // Convert to objects for merge
  const currentSkillsObj = convertSkillDataToObject(currentSkills);
  const updateObj = convertSkillDataToObject(update);

  const updatedSkillsObj: UserSkillData = {
    ...currentSkillsObj,
    ...updateObj,
  };

  // Convert back to array and update user data
  const updatedSkills = convertSkillDataToArray(updatedSkillsObj);

  const profileUpdate: Profile = {
    ...profile,
    skills: updatedSkills
  };

  store.dispatch(updateProfile({
    data: profileUpdate
  }));

  return true;
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
 * Update the users' profile based on an array of
 * other experience skill data and additional skill content
 */
export const updateAdditionalSkills = (otherExperience: UserSkill[], additionalSkills: string) => {
  const appState = store.getState();
  const profile = appState.profile.data;

  if (!profile) {
    return;
  }

  // Pull current skill data
  const currentSkills = profile.skills;

  // Convert to objects for merge
  const currentSkillsObj = convertSkillDataToObject(currentSkills);
  const updateObj = convertSkillDataToObject(otherExperience);

  const updatedSkillsObj: UserSkillData = {
    ...currentSkillsObj,
    ...updateObj,
  };

  // Convert back to array and update user data
  const updatedSkills = convertSkillDataToArray(updatedSkillsObj);

  const profileUpdate: Profile = {
    ...profile,
    skills: updatedSkills,
    additionalSkills
  };

  // If this is the first completion of the profile section, add a timestamp
  if (!profile.completionDate) {
    const timestamp = new Date().toISOString();
    profileUpdate.completionDate = timestamp;
  }

  store.dispatch(updateProfile({
    data: profileUpdate
  }));

  return true;
};
