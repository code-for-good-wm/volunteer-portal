import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { PrimaryProfileSectionId, Profile } from '../types/profile';
import { RootState } from './store';

interface ProfileState {
  currentSection: PrimaryProfileSectionId | null;
  data: Profile | null;
}

interface ProfileUpdate {
  currentSection?: PrimaryProfileSectionId | null;
  data?: Profile | null;
}

const initialState: ProfileState = {
  currentSection: null,
  data: null,
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
    },
  },
});

export const { updateProfile } = profileSlice.actions;

export const currentSection = (state: RootState) => state.profile.currentSection;
export const profile = (state: RootState) => state.profile.data;

export default profileSlice.reducer;
