import {
  createEntityAdapter,
  createSlice,
  PayloadAction,
} from '@reduxjs/toolkit';
import { Slot } from '../types/slot';
import { RootState } from './store';

const slotsAdapter = createEntityAdapter<Slot>({
  selectId: (slot) => slot._id,
});

const initialState = slotsAdapter.getInitialState({
  loading: false,
});

export const slotsSlice = createSlice({
  name: 'slots',
  initialState,
  reducers: {
    slotAdded: slotsAdapter.upsertOne,
    slotsUpserted(state, action: PayloadAction<{ slots: Slot[] }>) {
      state.loading = false;
      slotsAdapter.upsertMany(state, action.payload.slots);
    },
  },
});

export const { slotAdded, slotsUpserted } = slotsSlice.actions;

export const {
  selectAll: selectAllSlots,
  selectById: selectSlotById,
  selectIds: selectSlotIds,
} = slotsAdapter.getSelectors((state: RootState) => state.slots);

export default slotsSlice.reducer;
