import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Event, Program } from '../types/event';

interface ProgramsState {
  programs: Program[] | null;
  program: Program | null;
  events: Event[] | null;
}

interface ProgramUpdate {
  program?: Program | null;
  event?: Event | null;
}

const initialState: ProgramsState = {
  programs: null,
  program: null,
  events: null
};

export const programsSlice = createSlice({
  name: 'programs',
  initialState,
  reducers: {
    updateProgram: (draftState, action: PayloadAction<ProgramUpdate>) => {
      if (action.payload.program !== undefined) {
        draftState.program = action.payload.program;
      }
    },
    updateProgramEvent: (draftState, action: PayloadAction<ProgramUpdate>) => {
      if (action.payload.event !== undefined && action.payload.event !== null) {
        const currEvents: Event[] = draftState.events ?? [];
        const eventIndex = action.payload.event !== null
          ? draftState.events?.findIndex((e: Event) => e !== null && e._id === action.payload.event?._id)
          : -1;
        // update
        if (eventIndex !== undefined && eventIndex > -1) {
          const newEvents = [...currEvents];
          newEvents.splice(eventIndex as number, 0, action.payload.event as Event);
          draftState.events = newEvents;
        }
        //insert
        else {
          draftState.events = [...currEvents, action.payload.event as Event];
        }
      }
    },
  },
});

export const { updateProgram, updateProgramEvent } = programsSlice.actions;

export default programsSlice.reducer;
