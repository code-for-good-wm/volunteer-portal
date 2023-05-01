import { createSelector } from '@reduxjs/toolkit';
import { user } from '../authSlice';
import { selectAllEvents } from '../eventsSlice';
import { selectAllAttendances } from '../eventAttendanceSlice';
import { EventAttendance } from '../../types/event';

export const selectUpcomingEventsAndAttendance = createSelector(
  [user, selectAllEvents, selectAllAttendances],
  (currentUser, events, attendances) => {
    const userAttendances: { [key: string]: EventAttendance } = {};
    if (currentUser?._id && attendances && attendances.length > 0) {
      attendances.filter(a => a.user === currentUser?._id).map(a => userAttendances[a.event] = a);
    }
    return events.map(e => ({ key: e._id, event: e, attendance: userAttendances[e._id] }));
  }
);