import { Slot } from '../types/slot';
import { store } from '../store/store';
import { slotsUpserted } from '../store/slotsSlice';
import { updateAlert } from '../store/alertSlice';
import {
  getApiBaseUrl,
  getAuthToken,
  getDefaultRequestHeaders,
} from '../helpers/functions';

export const loadSlotsForPosition = async (positionId: string) => {
  try {
    const token = await getAuthToken();
    const requestInit = {
      headers: getDefaultRequestHeaders(token),
    } as RequestInit;

    const slotsResponse = await fetch(
      `${getApiBaseUrl()}/position/${positionId}/slot`,
      requestInit,
    );
    if (!slotsResponse.ok) {
      throw new Error('Failed to load slots for this position.');
    }

    const slotsData = (await slotsResponse.json()) as Slot[];

    store.dispatch(
      slotsUpserted({
        slots: slotsData,
      }),
    );

    return slotsData;
  } catch (error) {
    store.dispatch(
      updateAlert({
        visible: true,
        theme: 'error',
        content:
          'An error occurred while loading team assignments for this position.',
      }),
    );

    return [];
  }
};
