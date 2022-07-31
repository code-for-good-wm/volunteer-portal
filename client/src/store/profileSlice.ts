import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { PrimaryProfileSectionId, Profile } from '../types/profile';
import { RootState } from './store';

interface ProfileState {
  currentSection: PrimaryProfileSectionId | null;
  data: Profile | null;
  showRegistrationComplete: boolean;
}

interface ProfileUpdate {
  currentSection?: PrimaryProfileSectionId | null;
  data?: Profile | null;
  showRegistrationComplete?: boolean;
}

const initialState: ProfileState = {
  currentSection: null,
  data: null,
  showRegistrationComplete: false,
};

/**
 * Please note that we're using the Redux Toolkit here,
 * which is allowing us to assign new values to state using
 * the Immer library underneath the hood.
 * https://redux-toolkit.js.org/usage/usage-guide
 */
export const profileSlice = createSlice({
  name: 'profile',
  initialState,
  reducers: {
    updateProfile: (draftState, action: PayloadAction<ProfileUpdate>) => {
      if (action.payload.currentSection !== undefined) {
        draftState.currentSection = action.payload.currentSection;
      }
      if (action.payload.data !== undefined) {
        draftState.data = action.payload.data;
      }
      if (action.payload.showRegistrationComplete !== undefined) {
        draftState.showRegistrationComplete = action.payload.showRegistrationComplete;
      }
    },
  },
});

export const { updateProfile } = profileSlice.actions;

export const currentSection = (state: RootState) => state.profile.currentSection;
export const profile = (state: RootState) => state.profile.data;
export const showRegistrationComplete = (state: RootState) => state.profile.showRegistrationComplete;

export default profileSlice.reducer;
