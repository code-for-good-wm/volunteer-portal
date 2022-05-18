import { FirebaseError } from '@firebase/util';
import { createUserWithEmailAndPassword, getAuth, signInWithEmailAndPassword } from 'firebase/auth';

type SignInParams = {
  email: string,
  password: string,
  success?: () => void,
  failure?: (message: string) => void,
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
    const { message, code } = authError;
    console.error('Error signing in: ', authError);

    // TODO: Build custom messaging based on code
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
    await createUserWithEmailAndPassword(auth, email, password);
    console.log('New user creation successful.');
    // We'll use an auth listener to handle changes
    if (success) {
      success();
    }
  } catch (error) {
    const authError = error as FirebaseError;
    const { message, code } = authError;
    console.error('Error creating new user: ', authError);

    // TODO: Build custom messaging based on code
    if (failure) {
      failure(message);
    }
  }
};
