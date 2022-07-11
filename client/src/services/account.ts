import { FirebaseError } from '@firebase/util';
import { deleteUser, EmailAuthProvider, getAuth, reauthenticateWithCredential, updateEmail, updatePassword } from 'firebase/auth';

import { User } from '../types/user';
import { DeleteUserAccountParams, UpdateUserEmailParams, UpdateUserPasswordParams } from '../types/services';

import { store } from '../store/store';
import { updateAuth } from '../store/authSlice';

export const updateUserEmail = async (params: UpdateUserEmailParams) => {
  const {
    email,
    password,
    success,
    failure
  } = params;

  const auth = getAuth();
  const fbUser = auth.currentUser;

  const appState = store.getState();
  const { user } = appState.auth;

  try {
    if (!fbUser) {
      throw new Error('User not authenticated.');
    }

    const currentEmail = user?.email;

    if (!currentEmail) {
      throw new Error('User email unavailable.');
    }

    // Re-authenticate user
    // https://firebase.google.com/docs/auth/web/manage-users#re-authenticate_a_user
    const credential = EmailAuthProvider.credential(currentEmail, password);
    await reauthenticateWithCredential(fbUser, credential);

    // Update email with Firebase
    await updateEmail(fbUser, email);

    // Acquire bearer token
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
      body: JSON.stringify({
        email
      })
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

    if (success) {
      success();
    }
  } catch (error) {
    const authError = error as FirebaseError;
    const { code } = authError;

    // Build custom error messaging
    let message = 'Could not update email at this time.  Check your network connection and try again later.';
    if (code === 'auth/email-already-in-use') {
      message = 'An account already exists for this email address.';
    } else if (code === 'auth/invalid-email') {
      message = 'The email address is invalid and cannot be used.';
    } else if (code === 'auth/wrong-password') {
      message = 'The current password you entered is incorrect; please try again.';
    }

    if (failure) {
      failure(message);
    }
  }
};

export const updateUserPassword = async (params: UpdateUserPasswordParams) => {
  const {
    password,
    newPassword,
    success,
    failure
  } = params;

  const auth = getAuth();
  const fbUser = auth.currentUser;

  const appState = store.getState();
  const { user } = appState.auth;

  try {
    if (!fbUser) {
      throw new Error('User not authenticated.');
    }

    const email = user?.email;

    if (!email) {
      throw new Error('User email unavailable.');
    }

    // Re-authenticate user
    // https://firebase.google.com/docs/auth/web/manage-users#re-authenticate_a_user
    const credential = EmailAuthProvider.credential(email, password);
    await reauthenticateWithCredential(fbUser, credential);

    // Update email with Firebase
    await updatePassword(fbUser, newPassword);

    if (success) {
      success();
    }
  } catch (error) {
    const authError = error as FirebaseError;
    const { code } = authError;

    // Build custom error messaging
    let message = 'Could not update password at this time.  Check your network connection and try again later.';
    if (code === 'auth/wrong-password') {
      message = 'The current password you entered is incorrect; please try again.';
    } else if (code === 'auth/invalid-password') {
      message = 'The submitted password does not meet minimum requirements.';
    }

    if (failure) {
      failure(message);
    }
  }
};

export const deleteUserAccount = async (params: DeleteUserAccountParams) => {
  const {
    password,
    success,
    failure
  } = params;

  const auth = getAuth();
  const fbUser = auth.currentUser;

  const appState = store.getState();
  const { user } = appState.auth;

  try {
    if (!fbUser) {
      throw new Error('User not authenticated.');
    }

    const email = user?.email;

    if (!email) {
      throw new Error('User email unavailable.');
    }

    // Re-authenticate user
    // https://firebase.google.com/docs/auth/web/manage-users#re-authenticate_a_user
    const credential = EmailAuthProvider.credential(email, password);
    await reauthenticateWithCredential(fbUser, credential);

    // Acquire bearer token
    const token = await fbUser?.getIdToken() || '';

    const userId = appState.auth.user?._id;

    // Attempt removal of user data
    const userUrl = `${process.env.REACT_APP_AZURE_CLOUD_FUNCTION_BASE_URL}/api/user/${userId}/`;

    const userResponse = await fetch(userUrl, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!userResponse.ok) {
      throw new Error('Failed to delete user data.');
    }

    // Delete user account in Firebase
    await deleteUser(fbUser);

    // IMPORTANT: Success callback should sign out user and reset app state
    // We're not doing so here in order to allow for UI cleanup
    if (success) {
      success();
    }
  } catch (error) {
    const authError = error as FirebaseError;
    const { code } = authError;

    // Build custom error messaging
    let message = 'Could not remove account at this time.  Check your network connection and try again later.';
    if (code === 'auth/wrong-password') {
      message = 'The current password you entered is incorrect; please try again.';
    }

    if (failure) {
      failure(message);
    }
  }
};
