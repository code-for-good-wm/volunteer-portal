import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { User } from '../types/user';
import { Profile } from '../types/profile';
import { RootState } from './store';

interface UsersState {
  updating: boolean; // Used to prevent multiple pulls of data
  users: User[] | null;
  profiles: Profile[] | null;
}

interface UsersUpdate {
  updating?: boolean;
  users?: User[] | null;
  profiles?: Profile[] | null;
}

const initialState: UsersState = {
  updating: false,
  users: null,
  profiles: null,
};

/**
 * Please note that we're using the Redux Toolkit here,
 * which is allowing us to assign new values to state using
 * the Immer library underneath the hood.
 * https://redux-toolkit.js.org/usage/usage-guide
 */
export const usersSlice = createSlice({
  name: 'users',
  initialState,
  reducers: {
    updateUsers: (draftState, action: PayloadAction<UsersUpdate>) => {
      if (action.payload.users !== undefined) {
        draftState.users = action.payload.users;
      }
      if (action.payload.profiles !== undefined) {
        draftState.profiles = action.payload.profiles;
      }
      if (action.payload.updating !== undefined) {
        draftState.updating = action.payload.updating;
      }
    },
  },
});

export const { updateUsers } = usersSlice.actions;

export const users = (state: RootState) => state.users.users;
export const profiles = (state: RootState) => state.users.profiles;
export const updating = (state: RootState) => state.users.updating;

export default usersSlice.reducer;
