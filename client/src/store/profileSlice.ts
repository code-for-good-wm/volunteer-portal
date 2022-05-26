import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { PrimaryProfileSectionId } from '../types/profile';
import { RootState } from './store';

interface ProfileState {
  currentSection: PrimaryProfileSectionId | null;
}

interface ProfileUpdate {
  currentSection?: PrimaryProfileSectionId | null;
}

const initialState: ProfileState = {
  currentSection: null,
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
    },
  },
});

export const { updateProfile } = profileSlice.actions;

export const currentSection = (state: RootState) => state.profile.currentSection;

export default profileSlice.reducer;
