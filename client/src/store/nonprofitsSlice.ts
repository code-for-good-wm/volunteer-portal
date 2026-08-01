import {
  createEntityAdapter,
  createSlice,
  PayloadAction,
} from '@reduxjs/toolkit';
import { Nonprofit } from '../types/nonprofit';
import { RootState } from './store';

const nonprofitsAdapter = createEntityAdapter<Nonprofit>({
  selectId: (nonprofit) => nonprofit._id,
});

const initialState = nonprofitsAdapter.getInitialState({
  loading: false,
});

export const nonprofitsSlice = createSlice({
  name: 'nonprofits',
  initialState,
  reducers: {
    nonprofitAdded: nonprofitsAdapter.upsertOne,
    nonprofitRemoved: nonprofitsAdapter.removeOne,
    nonprofitsReceived(
      state,
      action: PayloadAction<{ nonprofits: Nonprofit[] }>,
    ) {
      state.loading = false;
      nonprofitsAdapter.setAll(state, action.payload.nonprofits);
    },
  },
});

export const { nonprofitAdded, nonprofitRemoved, nonprofitsReceived } =
  nonprofitsSlice.actions;

export const {
  selectAll: selectAllNonprofits,
  selectById: selectNonprofitById,
  selectIds: selectNonprofitIds,
} = nonprofitsAdapter.getSelectors((state: RootState) => state.nonprofits);

export default nonprofitsSlice.reducer;
