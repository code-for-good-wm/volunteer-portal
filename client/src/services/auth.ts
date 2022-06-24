import { FirebaseError } from '@firebase/util';
import { createUserWithEmailAndPassword, getAuth, sendPasswordResetEmail, signInWithEmailAndPassword, User as FirebaseUser } from 'firebase/auth';

import { Profile } from '../types/profile';
import { User } from '../types/user';
import { SignInParams, RecoverPasswordParams } from '../types/services';

import { store } from '../store/store';
import { updateAuth } from '../store/authSlice';
import { updateProfile } from '../store/profileSlice';
import { resetAppState } from '../helpers/functions';

export const handleAuthStateChange = async (fbUser: FirebaseUser | null) => {
  const appState = store.getState();
  const { signedIn, updating, user } = appState.auth;

  const auth = getAuth();

  if (fbUser) {
    if (!updating && !user) {
      // Set updating to true while pulling data; show loader in UI
      store.dispatch(
        updateAuth({
          updating: true,
        })
      );
      
      try {
        // Acquire bearer token
        const token = await fbUser.getIdToken();

        // Acquire user document
        const userUrl = `${process.env.REACT_APP_AZURE_CLOUD_FUNCTION_BASE_URL}/api/user`;

        const userResponse = await fetch(userUrl, {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
        });

        if (!userResponse.ok) {
          throw new Error('Failed to acquire user data.');
        }

        const userData = await userResponse.json() as User;

        // Acquire user profile
        const { _id } = userData;
        const profileUrl = `${process.env.REACT_APP_AZURE_CLOUD_FUNCTION_BASE_URL}/api/user/${_id}/profile`;

        console.log('Fetching profile: ', profileUrl);

        const profileResponse = await fetch(profileUrl, {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
        });

        if (!profileResponse.ok) {
          throw new Error('Failed to acquire user profile.');
        }

        const profileData = await profileResponse.json() as Profile;

        store.dispatch(
          updateProfile({
            data: profileData,
          })
        );

        store.dispatch(
          updateAuth({
            signedIn: true,
            user: userData,
            updating: false,
          })
        );
      } catch (error) {
        // Reset app state
        resetAppState();

        // Sign out user
        if (auth.currentUser) {
          auth.signOut();
        }

        // TODO: Display error in UI?
      }
    } else {
      // Ignore other cases?
    }
  } else {
    // No active user; sign out if needed
    if (signedIn) {
      store.dispatch(
        updateAuth({
          signedIn: false,
          user: null,
        })
      );
    }
  }
};

export const signInUser = async (params: SignInParams) => {
  const {
    email,
    password,
    success,
    failure,
  } = params;

  const auth = getAuth();
  
  try {
    await signInWithEmailAndPassword(auth, email, password);
    // We'll use an auth listener to handle changes
    if (success) {
      success();
    }
  } catch (error) {
    const authError = error as FirebaseError;
    const { code } = authError;

    // Build custom error messaging
    let message = 'Could not sign in at this time.  Check your network connection and try again later.';
    if (code === 'auth/user-not-found' || code === 'auth/wrong-password') {
      message = 'Could not sign in with these credentials.  Check your information and try again.';
    } else if (code === 'auth/email-invalid') {
      message = 'The email address is invalid and cannot be used.';
    } else if (code === 'auth/user-disabled') {
      message = 'This account has been disabled; please contact the admin team for assistance.';
    } else if (code === 'auth/too-many-requests') {
      message = 'This device has made too many consecutive authorization requests and, due to security concerns, has been temporarily disabled.  Please try again later.';
    }

    if (failure) {
      failure(message);
    }
  }
};

export const createNewUser = async (params: SignInParams) => {
  const {
    email,
    password,
    success,
    failure,
  } = params;

  const auth = getAuth();
  
  try {
    // Set updating to true to avoid automatic data load
    store.dispatch(
      updateAuth({
        updating: true,
      })
    );
    
    // Create the new Firebase user
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);

    // Acquire bearer token
    const { user } = userCredential;
    const token = await user.getIdToken();

    // Prep fetch call
    const userUrl = `${process.env.REACT_APP_AZURE_CLOUD_FUNCTION_BASE_URL}/api/user`;
    const body = JSON.stringify({
      email,
    });

    const userResponse = await fetch(userUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body
    });

    if (!userResponse.ok) {
      // TODO: Possible 400 and 401 responses here; should we create custom messaging?
      throw new Error('Failed to create a new user document.');
    }

    const userData = await userResponse.json() as User;

    // Acquire user profile
    const { _id } = userData;
    const profileUrl = `${process.env.REACT_APP_AZURE_CLOUD_FUNCTION_BASE_URL}/api/user/${_id}/profile`;

    const profileResponse = await fetch(profileUrl, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!profileResponse.ok) {
      throw new Error('Failed to acquire user profile.');
    }

    const profileData = await profileResponse.json() as Profile;

    store.dispatch(
      updateProfile({
        data: profileData
      })
    );

    store.dispatch(
      updateAuth({
        signedIn: true,
        user: userData,
        updating: false,
      })
    );

    if (success) {
      success();
    }
  } catch (error) {
    const authError = error as FirebaseError;
    const { code } = authError;

    // Set updating to false
    store.dispatch(
      updateAuth({
        updating: false,
      })
    );

    // If signed in, sign out user
    if (auth.currentUser) {
      auth.signOut();
    }

    // Build custom error messaging
    let message = 'Could not create account at this time.  Check your network connection and try again later.';
    if (code === 'auth/email-already-in-use') {
      message = 'An account already exists for this email address.';
    } else if (code === 'auth/invalid-email') {
      message = 'The email address is invalid and cannot be used to create an account.';
    }

    if (failure) {
      failure(message);
    }
  }
};

export const recoverPassword = async (params: RecoverPasswordParams) => {
  const {
    email,
    success,
    failure,
  } = params;

  const auth = getAuth();
  
  try {
    await sendPasswordResetEmail(auth, email);
    // We'll use an auth listener to handle changes
    if (success) {
      success();
    }
  } catch (error) {
    const authError = error as FirebaseError;
    const { code } = authError;

    // Build custom error messaging
    let message = 'Could not send a password recovery email.  Check your network connection and try again later.';
    if (code === 'auth/invalid-email') {
      message = 'The email address is invalid and cannot be used.';
    } else if (code === 'auth/user-not-found') {
      message = 'This email address is not associated with a valid account.';
    }

    if (failure) {
      failure(message);
    }
  }
};
