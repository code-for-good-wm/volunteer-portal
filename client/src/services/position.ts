import { Position } from '../types/position';
import { store } from '../store/store';
import {
  positionAdded,
  positionRemoved,
  positionsUpserted,
} from '../store/positionsSlice';
import { positionSlotsRemoved } from '../store/slotsSlice';
import { updateAlert } from '../store/alertSlice';
import { loadSlotsForPosition } from './slot';
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

export type PositionCreate = Pick<Position, 'role' | 'slotCount'> & {
  notes?: string;
};

/**
 * Create a position on a project. The server also creates one open slot per
 * person (slotCount). Resolves to the saved position, or null if it failed.
 */
export const createPosition = async (
  projectId: string,
  position: PositionCreate,
): Promise<Position | null> => {
  try {
    const token = await getAuthToken();

    const response = await fetch(
      `${getApiBaseUrl()}/project/${projectId}/position`,
      {
        method: 'POST',
        headers: getDefaultRequestHeaders(token),
        body: JSON.stringify(position),
      },
    );
    if (!response.ok) {
      throw new Error('Failed to create position.');
    }

    const positionData = (await response.json()) as Position;
    store.dispatch(positionAdded(positionData));

    return positionData;
  } catch (error) {
    store.dispatch(
      updateAlert({
        visible: true,
        theme: 'error',
        content:
          'An error occurred while adding this position. Check your network connection and try again.',
      }),
    );

    return null;
  }
};

/**
 * Update a position. The server adds or removes open slots to match a new
 * slotCount. Resolves to the saved position, or null if it failed (the alert
 * shows the server's reason, e.g. when filled slots would be removed).
 */
export const updatePosition = async (
  projectId: string,
  positionId: string,
  position: PositionCreate,
): Promise<Position | null> => {
  try {
    const token = await getAuthToken();

    const response = await fetch(
      `${getApiBaseUrl()}/project/${projectId}/position/${positionId}`,
      {
        method: 'PUT',
        headers: getDefaultRequestHeaders(token),
        body: JSON.stringify(position),
      },
    );
    if (!response.ok) {
      const body = await response.json().catch(() => null);
      throw new Error(body?.error?.message ?? 'Failed to update position.');
    }

    const positionData = (await response.json()) as Position;
    store.dispatch(positionAdded(positionData));
    // The server may have added open slots for a larger count.
    loadSlotsForPosition(positionId);

    return positionData;
  } catch (error) {
    store.dispatch(
      updateAlert({
        visible: true,
        theme: 'error',
        content: `Couldn't save this position. ${
          error instanceof Error ? error.message : ''
        }`.trim(),
      }),
    );

    return null;
  }
};

/**
 * Delete a position and its slots. The server refuses while anyone is invited
 * to or confirmed in one of its slots. Resolves to true if it was deleted.
 */
export const deletePosition = async (
  projectId: string,
  positionId: string,
): Promise<boolean> => {
  try {
    const token = await getAuthToken();

    const response = await fetch(
      `${getApiBaseUrl()}/project/${projectId}/position/${positionId}`,
      {
        method: 'DELETE',
        headers: getDefaultRequestHeaders(token),
      },
    );
    if (!response.ok) {
      const body = await response.json().catch(() => null);
      throw new Error(body?.error?.message ?? 'Failed to delete position.');
    }

    store.dispatch(positionRemoved(positionId));
    store.dispatch(positionSlotsRemoved({ positionId }));

    return true;
  } catch (error) {
    store.dispatch(
      updateAlert({
        visible: true,
        theme: 'error',
        content: `Couldn't delete this position. ${
          error instanceof Error ? error.message : ''
        }`.trim(),
      }),
    );

    return false;
  }
};
