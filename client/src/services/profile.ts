import { store } from '../store/store';
import { getAuth } from 'firebase/auth';

import { Profile, ProfileUpdate, UserSkill } from '../types/profile';
import { User } from '../types/user';
import { updateAuth } from '../store/authSlice';
import { UpdateAdditionalSkillsParams, UpdateGettingStartedProfileDataParams, UpdateUserRolesParams, UpdateUserSkillsParams } from '../types/services';

import { updateProfile } from '../store/profileSlice';
import { updateAlert } from '../store/alertSlice';
import { designSkillCodes, otherSkillCodes, technicalSkillCodes } from '../helpers/constants';
import { getApiBaseUrl, getDefaultRequestHeaders } from '../helpers/functions';

export const updateUserRoles = async (params: UpdateUserRolesParams) => {
  const {
    roles,
    success,
    failure
  } = params;

  const auth = getAuth();
  const appState = store.getState();

  try {
    // Acquire bearer token
    const fbUser = auth.currentUser;
    const token = await fbUser?.getIdToken() || '';

    const userId = appState.auth.user?._id;

    // Attempt profile update
    const profileUrl = `${getApiBaseUrl()}/user/${userId}/profile`;
    const body = JSON.stringify({
      roles,
    });

    const profileResponse = await fetch(profileUrl, {
      method: 'PUT',
      headers: getDefaultRequestHeaders(token),
      body,
    });

    if (!profileResponse.ok) {
      throw new Error('Failed to update user profile.');
    }

    const newProfileData = await profileResponse.json() as Profile;

    // Update local data
    store.dispatch(
      updateProfile({
        data: newProfileData,
      })
    );

    if (success) {
      success();
    }
  } catch (error) {
    const message = 'An error occurred while updating user data.';

    // Show alert
    store.dispatch(
      updateAlert({
        visible: true,
        theme: 'error',
        content: message,
      })
    );

    if (failure) {
      failure(message);
    }
  }
};

export const updateGettingStartedProfileData = async (params: UpdateGettingStartedProfileDataParams) => {
  const {
    userUpdate,
    profileUpdate,
    success,
    failure
  } = params;

  const auth = getAuth();
  const appState = store.getState();

  try {
    // Acquire bearer token
    const fbUser = auth.currentUser;
    const token = await fbUser?.getIdToken() || '';

    const userId = appState.auth.user?._id;

    // Attempt user update
    const userUrl = `${getApiBaseUrl()}/user/${userId}/`;

    const userResponse = await fetch(userUrl, {
      method: 'PUT',
      headers: getDefaultRequestHeaders(token),
      body: JSON.stringify(userUpdate)
    });

    if (!userResponse.ok) {
      throw new Error('Failed to update user data.');
    }

    const newUserData = await userResponse.json() as User;

    // Update local data
    store.dispatch(
      updateAuth({
        user: newUserData,
      })
    );

    // Attempt profile update
    const profileUrl = `${getApiBaseUrl()}/user/${userId}/profile`;

    const profileResponse = await fetch(profileUrl, {
      method: 'PUT',
      headers: getDefaultRequestHeaders(token),
      body: JSON.stringify(profileUpdate),
    });

    if (!profileResponse.ok) {
      throw new Error('Failed to update user profile.');
    }

    const newProfileData = await profileResponse.json() as Profile;

    // Update local data
    store.dispatch(
      updateProfile({
        data: newProfileData,
      })
    );

    if (success) {
      success();
    }
  } catch (error) {
    const message = 'An error occurred while updating user data.';

    // Show alert
    store.dispatch(
      updateAlert({
        visible: true,
        theme: 'error',
        content: message,
      })
    );

    if (failure) {
      failure(message);
    }
  }
};

export const updateUserSkills = async (params: UpdateUserSkillsParams) => {
  const {
    skills,
    success,
    failure
  } = params;

  const auth = getAuth();
  const appState = store.getState();
  const profile = appState.profile.data;

  if (!profile) {
    throw new Error('User profile data unavailable.');
  }

  // Pull current skill data
  const currentSkills = profile.skills;

  // Pull document ID's for existing data and apply to update if possible
  const skillUpdate = skills.map((skill) => {
    let merge: UserSkill;
    const existing = currentSkills.find((existingSkill) => {
      existingSkill.code === skill.code;
    });
    if (existing) {
      merge = {
        _id: existing._id,
        code: skill.code,
        level: skill.level
      };
    } else {
      merge = skill;
    }
    return merge;
  });

  try {
    // Acquire bearer token
    const fbUser = auth.currentUser;
    const token = await fbUser?.getIdToken() || '';

    const userId = appState.auth.user?._id;

    // Attempt profile update
    const profileUrl = `${getApiBaseUrl()}/user/${userId}/profile`;
    const body = JSON.stringify({
      skills: skillUpdate,
    });

    const profileResponse = await fetch(profileUrl, {
      method: 'PUT',
      headers: getDefaultRequestHeaders(token),
      body,
    });

    if (!profileResponse.ok) {
      throw new Error('Failed to update user profile.');
    }

    const newProfileData = await profileResponse.json() as Profile;

    // Update local data
    store.dispatch(
      updateProfile({
        data: newProfileData,
      })
    );

    if (success) {
      success();
    }
  } catch (error) {
    const message = 'An error occurred while updating user data.';

    // Show alert
    store.dispatch(
      updateAlert({
        visible: true,
        theme: 'error',
        content: message,
      })
    );

    if (failure) {
      failure(message);
    }
  }
};

export const updateAdditionalSkills = async (params: UpdateAdditionalSkillsParams) => {
  const {
    skills,
    additionalSkills,
    success,
    failure
  } = params;

  const auth = getAuth();
  const appState = store.getState();
  const profile = appState.profile.data;

  if (!profile) {
    throw new Error('User profile data unavailable.');
  }

  // Pull current skill data
  const currentSkills = profile.skills;

  // Pull document ID's for existing data and apply to update if possible
  const skillUpdate = skills.map((skill) => {
    let merge: UserSkill;
    const existing = currentSkills.find((existingSkill) => {
      existingSkill.code === skill.code;
    });
    if (existing) {
      merge = {
        _id: existing._id,
        code: skill.code,
        level: skill.level
      };
    } else {
      merge = skill;
    }
    return merge;
  });

  try {
    // Acquire bearer token
    const fbUser = auth.currentUser;
    const token = await fbUser?.getIdToken() || '';

    const userId = appState.auth.user?._id;

    // Build data for profile update
    const profileUpdate: ProfileUpdate = {
      skills: skillUpdate,
      additionalSkills,
    };

    // If this is the first completion of the profile section, 
    // add a timestamp and send a registration completion email
    let sendConfirmationEmail = false;
    if (!profile.completionDate) {
      const timestamp = new Date().toISOString();
      profileUpdate.completionDate = timestamp;
      sendConfirmationEmail = true;
    }

    // Attempt profile update
    const profileUrl = `${getApiBaseUrl()}/user/${userId}/profile`;
    const body = JSON.stringify(profileUpdate);

    const profileResponse = await fetch(profileUrl, {
      method: 'PUT',
      headers: getDefaultRequestHeaders(token),
      body,
    });

    if (!profileResponse.ok) {
      throw new Error('Failed to update user profile.');
    }

    const newProfileData = await profileResponse.json() as Profile;

    // Update local data
    store.dispatch(
      updateProfile({
        data: newProfileData,
      })
    );

    // Send completion email
    if (sendConfirmationEmail) {
      // NOTE: We're allowing this to fail quietly if an error occurs
      const emailUrl = `${getApiBaseUrl()}/user/${userId}/email/${import.meta.env.VITE_REGISTRATION_CONFIRMATION_EMAIL_TEMPLATE_ID}`;

      await fetch(emailUrl, {
        method: 'POST',
        headers: getDefaultRequestHeaders(token),
      });

      // Set showRegistrationComplete flag
      store.dispatch(
        updateProfile({
          showRegistrationComplete: true,
        })
      );
    }

    if (success) {
      success();
    }
  } catch (error) {
    const message = 'An error occurred while updating user data.';

    // Show alert
    store.dispatch(
      updateAlert({
        visible: true,
        theme: 'error',
        content: message,
      })
    );

    if (failure) {
      failure(message);
    }
  }
};

export const calculateProfilePercentComplete = (profile: Profile) => {
  // if there's a completion date, the profile is done
  if (profile.completionDate) {
    return 100;
  }

  let pct = 0;

  // no date and no roles means this is a new user
  if (profile.roles?.length === 0) {
    return pct;
  }

  // figure out how many sections plus (roles + profile) are needed
  // roles, profile, tech / design skills, additional
  const sections = 2 + (profile.roles.includes('designer') ? 1 : 0)
    + (profile.roles.includes('developer') ? 1 : 0) + 1;
  const increment = Math.ceil(100 / sections);

  pct += increment;

  if (!profile.agreements || !profile.agreements?.codeOfConduct) {
    return pct;
  }

  pct += increment;

  // no skills, but profile is complete
  if (profile.skills?.length === 0) {
    return pct;
  }

  // determine which skills sections have been done
  const skillCodes = profile.skills.filter(s => s.level > 0).map(s => s.code);
  profile.roles.forEach(r => {
    switch (r) {
    case 'designer':
      if (designSkillCodes.find(s => skillCodes.includes(s))) {
        pct += increment;
      }
      break;
    case 'developer':
      if (technicalSkillCodes.find(s => skillCodes.includes(s))) {
        pct += increment;
      }
      break;
    }
  });
  if (otherSkillCodes.find(s => skillCodes.includes(s))) {
    pct += increment;
  }

  return Math.min(pct, 100);
};
