import { Profile } from '../types/profile';
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
  const token = await fbUser?.getIdToken() || '';
  return token;
}

/**
 * Pull all users data from server and store in state (server will validate user permissions)
 */
export const getUsersData = async () => {
  store.dispatch(
    updateUsers({
      updating: true
    })
  );

  const usersUrl = `${getApiBaseUrl()}/users`;
  const requestInit = { headers: getDefaultRequestHeaders(await getBearerToken()) } as RequestInit;
  const usersResponse = await fetch(usersUrl, requestInit);

  if (!usersResponse.ok) {
    throw new Error('Failed to acquire users data.');
  }

  const usersData = await usersResponse.json() as User[];

  store.dispatch(
    updateUsers({
      updating: false,
      users: usersData
    })
  );

  return true;
};

/**
 * Pull all profiles data from server and store in state (server will validate user permissions)
 */
export const getProfilesData = async () => {
  store.dispatch(
    updateUsers({
      updating: true
    })
  );

  const profilesUrl = `${getApiBaseUrl()}/profiles`;
  const requestInit = { headers: getDefaultRequestHeaders(await getBearerToken()) } as RequestInit;
  const profilesResponse = await fetch(profilesUrl, requestInit);

  if (!profilesResponse.ok) {
    throw new Error('Failed to acquire users data.');
  }

  const profilesData = await profilesResponse.json() as Profile[];

  store.dispatch(
    updateUsers({
      updating: false,
      profiles: profilesData
    })
  );

  return true;
};

export const exportUsersAndProfilesData = async(params: TypedServiceParams<Response>) => {
  const {
    success,
    failure,
  } = params;

  const exportUrl = `${getApiBaseUrl()}/export`;

  fetch(exportUrl, {
    method: 'POST',
    headers: getDefaultRequestHeaders(await getBearerToken()),
  }).then((response) => {
    if (success) {
      success(response);
    }
  }, (err) => {
    const message = `Unable to export user data: ${err}`;
 
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
  });
};