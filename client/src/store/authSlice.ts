import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { User } from '../types/user';
import { RootState } from './store';

interface AuthState {
  signedIn?: boolean;
  user?: User | null;
}

const initialState: AuthState = {
  signedIn: false,
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
    updateAuth: (draftState, action: PayloadAction<AuthState>) => {
      if (action.payload.signedIn !== undefined) {
        draftState.signedIn = action.payload.signedIn;
      }
      if (action.payload.user !== undefined) {
        draftState.user = action.payload.user;
      }
    },
  },
});

export const { updateAuth } = authSlice.actions;

export const signedIn = (state: RootState) => state.auth.signedIn;

export default authSlice.reducer;
