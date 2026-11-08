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
    /** Drop every slot belonging to a position (e.g. after it's deleted). */
    positionSlotsRemoved(state, action: PayloadAction<{ positionId: string }>) {
      const ids = Object.values(state.entities)
        .filter((slot) => slot?.position === action.payload.positionId)
        .map((slot) => (slot as Slot)._id);
      slotsAdapter.removeMany(state, ids);
    },
    /** Replace one position's slots, dropping any the server no longer has. */
    positionSlotsLoaded(
      state,
      action: PayloadAction<{ positionId: string; slots: Slot[] }>,
    ) {
      const { positionId, slots } = action.payload;
      const keep = new Set(slots.map((slot) => slot._id));
      const stale = Object.values(state.entities)
        .filter(
          (slot) => slot && slot.position === positionId && !keep.has(slot._id),
        )
        .map((slot) => (slot as Slot)._id);
      state.loading = false;
      slotsAdapter.removeMany(state, stale);
      slotsAdapter.upsertMany(state, slots);
    },
  },
});

export const {
  slotAdded,
  slotsUpserted,
  positionSlotsLoaded,
  positionSlotsRemoved,
} = slotsSlice.actions;

export const {
  selectAll: selectAllSlots,
  selectById: selectSlotById,
  selectIds: selectSlotIds,
} = slotsAdapter.getSelectors((state: RootState) => state.slots);

export default slotsSlice.reducer;
