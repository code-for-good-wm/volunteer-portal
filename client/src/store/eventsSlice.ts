import { createEntityAdapter, createSelector, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Event } from '../types/event';
import { RootState } from './store';

const eventsAdapter = createEntityAdapter<Event>({
  selectId: event => event._id
});

const initialState = eventsAdapter.getInitialState({
  loading: false
});

export const eventsSlice = createSlice({
  name: 'events',
  initialState,
  reducers: {
    eventAdded: eventsAdapter.addOne,
    eventsReceived(state, action: PayloadAction<{ events: Event[] }>) {
      state.loading = false;
      eventsAdapter.setAll(state, action.payload.events);
    }
  },
});

export const { eventAdded, eventsReceived } = eventsSlice.actions;

export const {
  selectAll: selectAllEvents,
  selectById: selectEventById,
  selectIds: selectEventIds
} = eventsAdapter.getSelectors((state: RootState) => state.events);

export const selectEventsByName = createSelector(
  [selectAllEvents, (_state, name: string) => name],
  (events, name) => events.filter(e => e.name === name)
);

export const selectEventsByDescription = createSelector(
  [selectAllEvents, (_state, description: string) => description],
  (events, description) => events.filter(e => e.description === description)
);

export default eventsSlice.reducer;
