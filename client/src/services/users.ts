import { Profile, UserSkill } from '../types/profile';
import { EventAttendance } from '../types/event';
import { User } from '../types/user';

import { store } from '../store/store';
import { updateUsers } from '../store/usersSlice';
import { getDefaultRequestHeaders, getApiBaseUrl } from '../helpers/functions';
import { getAuth } from '@firebase/auth';
import { TypedServiceParams } from '../types/services';
import { updateAlert } from '../store/alertSlice';

async function getBearerToken(): Promise<string> {
  const auth = getAuth();
  const fbUser = auth.currentUser;
  const token = (await fbUser?.getIdToken()) || '';
  return token;
}

/**
 * Pull all users data from server and store in state (server will validate user permissions)
 */
export const getUsersData = async () => {
  store.dispatch(
    updateUsers({
      updating: true,
    }),
  );

  const usersUrl = `${getApiBaseUrl()}/users`;
  const requestInit = {
    headers: getDefaultRequestHeaders(await getBearerToken()),
  } as RequestInit;
  const usersResponse = await fetch(usersUrl, requestInit);

  if (!usersResponse.ok) {
    throw new Error('Failed to acquire users data.');
  }

  const usersData = (await usersResponse.json()) as User[];

  store.dispatch(
    updateUsers({
      updating: false,
      users: usersData,
    }),
  );

  return true;
};

/**
 * Pull all profiles data from server and store in state (server will validate user permissions)
 */
export const getProfilesData = async () => {
  store.dispatch(
    updateUsers({
      updating: true,
    }),
  );

  const requestInit = {
    headers: getDefaultRequestHeaders(await getBearerToken()),
  } as RequestInit;
  const profilesResponse = await fetch(
    `${getApiBaseUrl()}/profiles`,
    requestInit,
  );

  if (!profilesResponse.ok) {
    throw new Error('Failed to acquire users data.');
  }

  const profilesData = (await profilesResponse.json()) as Profile[];

  store.dispatch(
    updateUsers({
      updating: false,
      profiles: profilesData,
    }),
  );

  return true;
};

export const exportUsersAndProfilesData = async (
  params: TypedServiceParams<Response>,
) => {
  const { success, failure } = params;

  const exportUrl = `${getApiBaseUrl()}/export`;

  fetch(exportUrl, {
    method: 'POST',
    headers: getDefaultRequestHeaders(await getBearerToken()),
  })
    .then(async (response) => {
      // fetch only rejects on network errors, so an error response would
      // otherwise be saved as the CSV file.
      if (!response.ok) {
        const body = await response.json().catch(() => null);
        throw (
          body?.error?.message ?? `${response.status} ${response.statusText}`
        );
      }
      return response;
    })
    .then(
      (response) => {
        if (success) {
          success(response);
        }
      },
      (err) => {
        const message = `Unable to export user data: ${err}`;

        // Show alert
        store.dispatch(
          updateAlert({
            visible: true,
            theme: 'error',
            content: message,
          }),
        );

        if (failure) {
          failure(message);
        }
      },
    );
};

/**
 * Fetch one user's data from a `user/{userId}/...` endpoint. Board members and
 * admins can read anyone's; returns null (and shows an alert) on failure.
 */
const fetchUserData = async <T>(
  userId: string,
  path: string,
  what: string,
): Promise<T | null> => {
  try {
    const response = await fetch(`${getApiBaseUrl()}/user/${userId}/${path}`, {
      headers: getDefaultRequestHeaders(await getBearerToken()),
    });
    if (!response.ok) {
      throw new Error(`${response.status} ${response.statusText}`);
    }
    return (await response.json()) as T;
  } catch (error) {
    store.dispatch(
      updateAlert({
        visible: true,
        theme: 'error',
        content: `Unable to load this user's ${what}.`,
      }),
    );
    return null;
  }
};

/** A user's skill ratings (code and level). */
export const loadUserSkills = (userId: string) =>
  fetchUserData<UserSkill[]>(userId, 'skills', 'skills');

/** A user's attendance responses across events. */
export const loadUserAttendance = (userId: string) =>
  fetchUserData<EventAttendance[]>(
    userId,
    'event-attendance',
    'event attendance',
  );
