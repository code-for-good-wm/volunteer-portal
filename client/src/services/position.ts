import { Position } from '../types/position';
import { store } from '../store/store';
import { positionsUpserted } from '../store/positionsSlice';
import { updateAlert } from '../store/alertSlice';
import {
  getApiBaseUrl,
  getAuthToken,
  getDefaultRequestHeaders,
} from '../helpers/functions';

export const loadPositionsForProject = async (projectId: string) => {
  try {
    const token = await getAuthToken();
    const requestInit = {
      headers: getDefaultRequestHeaders(token),
    } as RequestInit;

    const positionsResponse = await fetch(
      `${getApiBaseUrl()}/project/${projectId}/position`,
      requestInit,
    );
    if (!positionsResponse.ok) {
      throw new Error('Failed to load positions for this project.');
    }

    const positionsData = (await positionsResponse.json()) as Position[];

    store.dispatch(
      positionsUpserted({
        positions: positionsData,
      }),
    );

    return positionsData;
  } catch (error) {
    store.dispatch(
      updateAlert({
        visible: true,
        theme: 'error',
        content: 'An error occurred while loading positions for this project.',
      }),
    );

    return [];
  }
};
