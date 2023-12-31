import { configureStore } from '@reduxjs/toolkit';
import authReducer from './authSlice';
import profileReducer from './profileSlice';
import alertReducer from './alertSlice';
import usersReducer from './usersSlice';
import eventsReducer from './eventsSlice';
import eventAttendancesReducer from './eventAttendanceSlice';
import programsReducer from './programsSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    profile: profileReducer,
    alert: alertReducer,
    users: usersReducer,
    events: eventsReducer,
    attendances: eventAttendancesReducer,
    programs: programsReducer
  }
});

// Infer root state and app dispatch types within the store itself
// https://redux.js.org/usage/usage-with-typescript
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

