import { AlertColor } from '@mui/material';
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from './store';

interface AlertState {
  visible: boolean,
  theme: AlertColor,
  duration: number, // milliseconds
  content: string;
}

interface AlertUpdate {
  visible?: boolean,
  theme?: AlertColor,
  duration?: number, // milliseconds
  content?: string;
}

const initialState: AlertState = {
  visible: false,
  theme: 'info',
  duration: 3000,
  content: '',
};

/**
 * Please note that we're using the Redux Toolkit here,
 * which is allowing us to assign new values to state using
 * the Immer library underneath the hood.
 * https://redux-toolkit.js.org/usage/usage-guide
 */
export const alertSlice = createSlice({
  name: 'alert',
  initialState,
  reducers: {
    updateAlert: (draftState, action: PayloadAction<AlertUpdate>) => {
      if (action.payload.visible !== undefined) {
        draftState.visible = action.payload.visible;
      }
      if (action.payload.theme !== undefined) {
        draftState.theme = action.payload.theme;
      }
      if (action.payload.duration !== undefined) {
        draftState.duration = action.payload.duration;
      }
      if (action.payload.content !== undefined) {
        draftState.content = action.payload.content;
      }
    },
  },
});

export const { updateAlert } = alertSlice.actions;

export const alert = (state: RootState) => state.alert;

export default alertSlice.reducer;
