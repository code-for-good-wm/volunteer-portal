import {
  createEntityAdapter,
  createSlice,
  PayloadAction,
} from '@reduxjs/toolkit';
import { Position } from '../types/position';
import { RootState } from './store';

const positionsAdapter = createEntityAdapter<Position>({
  selectId: (position) => position._id,
});

const initialState = positionsAdapter.getInitialState({
  loading: false,
});

export const positionsSlice = createSlice({
  name: 'positions',
  initialState,
  reducers: {
    positionAdded: positionsAdapter.upsertOne,
    positionsUpserted(state, action: PayloadAction<{ positions: Position[] }>) {
      state.loading = false;
      positionsAdapter.upsertMany(state, action.payload.positions);
    },
  },
});

export const { positionAdded, positionsUpserted } = positionsSlice.actions;

export const {
  selectAll: selectAllPositions,
  selectById: selectPositionById,
  selectIds: selectPositionIds,
} = positionsAdapter.getSelectors((state: RootState) => state.positions);

export default positionsSlice.reducer;
