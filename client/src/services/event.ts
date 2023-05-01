import { store } from '../store/store';

import { Event, EventAttendance } from '../types/event';
import { UpdateEventAttendanceParams } from '../types/services';
import { eventsReceived } from '../store/eventsSlice';
import { attendanceAdded, attendancesReceived } from '../store/eventAttendanceSlice';
import { updateAlert } from '../store/alertSlice';
import { getApiBaseUrl, getAuthToken, getDefaultRequestHeaders } from '../helpers/functions';

export const loadUpcomingEventsAndAttendance = async () => {
  const appState = store.getState();

  try {
    // Acquire bearer token
    const token = await getAuthToken();
    const requestInit = { headers: getDefaultRequestHeaders(token) } as RequestInit;

    // Load upcoming events
    const eventsResponse = await fetch(`${getApiBaseUrl()}/events`, requestInit);
    if (!eventsResponse.ok) {
      throw new Error('Failed to load upcoming events.');
    }

    const eventsData = await eventsResponse.json() as Event[];

    store.dispatch(
      eventsReceived({
        events: eventsData,
      })
    );

    // Load attendance for this person, but only log issues
    const userId = appState.auth.user?._id;
    const attendanceResponse = await fetch(`${getApiBaseUrl()}/user/${userId}/event-attendance`, requestInit);
    if (attendanceResponse.ok) {
      const attendanceData = await attendanceResponse.json() as EventAttendance[];
      store.dispatch(
        attendancesReceived({
          attendances: attendanceData
        })
      );
    } else {
      console.log('Unable to load attendance');
    }
  } catch (error) {
    const message = 'An error occurred while loading events and attendance.';

    // Show alert
    store.dispatch(
      updateAlert({
        visible: true,
        theme: 'error',
        content: message,
      })
    );
  }
};

export const updateEventAttendance = async (params: UpdateEventAttendanceParams) => {
  const {
    eventId,
    attendanceUpdate,
    success,
    failure
  } = params;

  const appState = store.getState();

  try {
    // Acquire bearer token
    const token = await getAuthToken();

    const userId = appState.auth.user?._id;

    // Attempt attendance update
    const attendanceUrl = `${getApiBaseUrl()}/user/${userId}/event-attendance/${eventId}`;
    const body = JSON.stringify(attendanceUpdate);

    const attendanceResponse = await fetch(attendanceUrl, {
      method: 'PUT',
      headers: getDefaultRequestHeaders(token),
      body,
    });

    if (!attendanceResponse.ok) {
      throw new Error('Failed to update event attendance.');
    }

    const newAttendanceData = await attendanceResponse.json() as EventAttendance;

    // Update local data
    store.dispatch(
      attendanceAdded(newAttendanceData)
    );

    if (success) {
      success();
    }
  } catch (error) {
    console.log(error);
    const message = 'An error occurred while updating your attendance.';

    // Show alert
    store.dispatch(
      updateAlert({
        visible: true,
        theme: 'error',
        content: message,
      })
    );

    if (failure) {
      failure(message);
    }
  }
};
