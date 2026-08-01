import { createEntityAdapter, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Project } from '../types/project';
import { RootState } from './store';

const projectsAdapter = createEntityAdapter<Project>({
  selectId: project => project._id
});

const initialState = projectsAdapter.getInitialState({
  loading: false
});

export const projectsSlice = createSlice({
  name: 'projects',
  initialState,
  reducers: {
    projectAdded: projectsAdapter.upsertOne,
    projectsReceived(state, action: PayloadAction<{ projects: Project[] }>) {
      state.loading = false;
      projectsAdapter.setAll(state, action.payload.projects);
    }
  },
});

export const { projectAdded, projectsReceived } = projectsSlice.actions;

export const {
  selectAll: selectAllProjects,
  selectById: selectProjectById,
  selectIds: selectProjectIds
} = projectsAdapter.getSelectors((state: RootState) => state.projects);

export default projectsSlice.reducer;
