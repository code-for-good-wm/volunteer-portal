import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { User } from '../types/user';
import { RootState } from './store';

interface AuthState {
  signedIn: boolean;
  updating: boolean; // Used to prevent multiple pulls of data
  user: User | null;
}

interface AuthUpdate {
  signedIn?: boolean;
  updating?: boolean;
  user?: User | null;
}

const initialState: AuthState = {
  signedIn: false,
  updating: false,
  user: null,
};

/**
 * Please note that we're using the Redux Toolkit here,
 * which is allowing us to assign new values to state using
 * the Immer library underneath the hood.
 * https://redux-toolkit.js.org/usage/usage-guide
 */
export const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    updateAuth: (draftState, action: PayloadAction<AuthUpdate>) => {
      if (action.payload.signedIn !== undefined) {
        draftState.signedIn = action.payload.signedIn;
      }
      if (action.payload.updating !== undefined) {
        draftState.updating = action.payload.updating;
      }
      if (action.payload.user !== undefined) {
        draftState.user = action.payload.user;
      }
    },
  },
});

export const { updateAuth } = authSlice.actions;

export const signedIn = (state: RootState) => state.auth.signedIn;
export const user = (state: RootState) => state.auth.user;
export const updating = (state: RootState) => state.auth.updating;

export default authSlice.reducer;
