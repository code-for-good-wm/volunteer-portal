import { store } from '../store/store';
import { getAuth } from 'firebase/auth';

import { Profile, ProfileUpdate, UserSkill } from '../types/profile';
import { User } from '../types/user';
import { updateAuth } from '../store/authSlice';
import { UpdateAdditionalSkillsParams, UpdateGettingStartedProfileDataParams, UpdateUserRolesParams, UpdateUserSkillsParams } from '../types/services';

import { updateProfile } from '../store/profileSlice';
import { updateAlert } from '../store/alertSlice';

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
    const profileUrl = `${process.env.REACT_APP_AZURE_CLOUD_FUNCTION_BASE_URL}/api/user/${userId}/profile`;
    const body = JSON.stringify({
      roles,
    });

    const profileResponse = await fetch(profileUrl, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
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
    const userUrl = `${process.env.REACT_APP_AZURE_CLOUD_FUNCTION_BASE_URL}/api/user/${userId}/`;

    const userResponse = await fetch(userUrl, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
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
    const profileUrl = `${process.env.REACT_APP_AZURE_CLOUD_FUNCTION_BASE_URL}/api/user/${userId}/profile`;

    const profileResponse = await fetch(profileUrl, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
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
    const profileUrl = `${process.env.REACT_APP_AZURE_CLOUD_FUNCTION_BASE_URL}/api/user/${userId}/profile`;
    const body = JSON.stringify({
      skills: skillUpdate,
    });

    const profileResponse = await fetch(profileUrl, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
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

    // If this is the first completion of the profile section, add a timestamp
    if (!profile.completionDate) {
      const timestamp = new Date().toISOString();
      profileUpdate.completionDate = timestamp;
    }

    // Attempt profile update
    const profileUrl = `${process.env.REACT_APP_AZURE_CLOUD_FUNCTION_BASE_URL}/api/user/${userId}/profile`;
    const body = JSON.stringify(profileUpdate);

    const profileResponse = await fetch(profileUrl, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
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
