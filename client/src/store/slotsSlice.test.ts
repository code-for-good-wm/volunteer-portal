import { describe, expect, it } from 'vitest';

import reducer, {
  positionSlotsLoaded,
  positionSlotsRemoved,
  slotsUpserted,
} from './slotsSlice';
import { Slot } from '../types/slot';

const slot = (id: string, position: string): Slot => ({
  _id: id,
  position,
  status: 'open',
});

describe('positionSlotsLoaded', () => {
  it("replaces one position's slots and leaves other positions alone", () => {
    let state = reducer(
      undefined,
      slotsUpserted({
        slots: [slot('a1', 'a'), slot('a2', 'a'), slot('b1', 'b')],
      }),
    );

    state = reducer(
      state,
      positionSlotsLoaded({ positionId: 'a', slots: [slot('a1', 'a')] }),
    );

    expect(state.ids).toEqual(['a1', 'b1']);
  });
});

describe('positionSlotsRemoved', () => {
  it("drops only that position's slots", () => {
    let state = reducer(
      undefined,
      slotsUpserted({ slots: [slot('a1', 'a'), slot('b1', 'b')] }),
    );

    state = reducer(state, positionSlotsRemoved({ positionId: 'a' }));

    expect(state.ids).toEqual(['b1']);
  });
});
