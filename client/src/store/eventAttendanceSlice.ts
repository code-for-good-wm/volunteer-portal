import { createEntityAdapter, createSelector, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { EventAttendance } from '../types/event';
import { RootState } from './store';

const eventAttendancesAdapter = createEntityAdapter<EventAttendance>({
  selectId: event => event._id
});

const initialState = eventAttendancesAdapter.getInitialState({
  loading: false
});

export const eventAttendancesSlice = createSlice({
  name: 'attendances',
  initialState,
  reducers: {
    attendanceAdded: eventAttendancesAdapter.addOne,
    attendancesReceived(state, action: PayloadAction<{ attendances: EventAttendance[] }>) {
      state.loading = false;
      eventAttendancesAdapter.setAll(state, action.payload.attendances);
    }
  },
});

export const { attendanceAdded, attendancesReceived } = eventAttendancesSlice.actions;

export const {
  selectAll: selectAllAttendances,
  selectById: selectAttendanceById,
  selectIds: selectAttendanceIds
} = eventAttendancesAdapter.getSelectors((state: RootState) => state.attendances);

export const selectAttendancesByEvent = createSelector(
  [selectAllAttendances, (_state, eventId: string) => eventId],
  (attendances, eventId) => attendances.filter(a => a.event === eventId)
);

export const selectAttendancesByUser = createSelector(
  [selectAllAttendances, (_state, userId: string) => userId],
  (attendances, userId) => attendances.filter(a => a.user === userId)
);

export default eventAttendancesSlice.reducer;
