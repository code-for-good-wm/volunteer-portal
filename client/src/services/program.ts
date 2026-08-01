import { store } from '../store/store';

import { Program } from '../types/event';
import { programsReceived } from '../store/programsSlice';
import { updateAlert } from '../store/alertSlice';
import {
  getApiBaseUrl,
  getAuthToken,
  getDefaultRequestHeaders,
} from '../helpers/functions';

export const loadPrograms = async () => {
  try {
    // Acquire bearer token
    const token = await getAuthToken();
    const requestInit = {
      headers: getDefaultRequestHeaders(token),
    } as RequestInit;

    const programsResponse = await fetch(
      `${getApiBaseUrl()}/programs`,
      requestInit,
    );
    if (!programsResponse.ok) {
      throw new Error('Failed to load programs.');
    }

    const programsData = (await programsResponse.json()) as Program[];

    store.dispatch(
      programsReceived({
        programs: programsData,
      }),
    );
  } catch (error) {
    // Show alert
    store.dispatch(
      updateAlert({
        visible: true,
        theme: 'error',
        content: 'An error occurred while loading programs.',
      }),
    );
  }
};
