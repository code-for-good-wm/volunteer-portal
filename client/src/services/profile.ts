import { store } from '../store/store';

import { convertSkillDataToArray, convertSkillDataToObject, parsePhone } from '../helpers/functions';
import { Profile, UserSkill, UserSkillData } from '../types/profile';
import { User } from '../types/user';
import { updateAuth } from '../store/authSlice';

/**
 * Pull the user's saved profile and return an object with
 * data organized for the 'getting started' view
 */
export const getGettingStartedProfileData = () => {
  const appState = store.getState();
  const { user } = appState.auth;

  // If no user data, return undefined
  if (!user) {
    return;
  }

  // Pull profile and return data
  const { name, phone, profile } = user;
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
        linkedInUrl,
        websiteUrl,
        portfolioUrl,
      },
      extraStuff: {
        previousVolunteer: !!previousVolunteer, // Could be undefined
        shirtSize,
        dietaryRestrictions,
      },
      accessibilityRequirements,
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
  const { user } = appState.auth;

  // If no user data, return undefined
  if (!user) {
    return;
  }

  // Pull profile and return data
  const { profile } = user;

  return profile.skills;
};

/**
 * Update the users' skills settings based on an array of skill data
 * @param {UserSkill[]} [update]
 */
export const updateUserSkills = (update?: UserSkill[]) => {
  if (!update) {
    return;
  }

  const appState = store.getState();
  const { user } = appState.auth;

  // If no user data, return undefined
  if (!user) {
    return;
  }

  // Pull current skill data
  const { profile } = user;
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

  const userUpdate: User = {
    ...user,
    profile: profileUpdate
  };

  store.dispatch(updateAuth({
    user: userUpdate
  }));

  return true;
};
