import {
  Nonprofit,
  NonprofitCreate,
  NonprofitUpdate,
} from '../types/nonprofit';
import { TypedServiceParams } from '../types/services';
import { store } from '../store/store';
import { nonprofitAdded, nonprofitsReceived } from '../store/nonprofitsSlice';
import { updateAlert } from '../store/alertSlice';
import {
  getApiBaseUrl,
  getAuthToken,
  getDefaultRequestHeaders,
} from '../helpers/functions';

export const loadNonprofits = async () => {
  try {
    const token = await getAuthToken();
    const requestInit = {
      headers: getDefaultRequestHeaders(token),
    } as RequestInit;

    const nonprofitsResponse = await fetch(
      `${getApiBaseUrl()}/nonprofits`,
      requestInit,
    );
    if (!nonprofitsResponse.ok) {
      throw new Error('Failed to load nonprofits.');
    }

    const nonprofitsData = (await nonprofitsResponse.json()) as Nonprofit[];

    store.dispatch(
      nonprofitsReceived({
        nonprofits: nonprofitsData,
      }),
    );
  } catch (error) {
    store.dispatch(
      updateAlert({
        visible: true,
        theme: 'error',
        content: 'An error occurred while loading nonprofits.',
      }),
    );
  }
};

export const loadNonprofit = async (nonprofitId: string) => {
  try {
    const token = await getAuthToken();
    const requestInit = {
      headers: getDefaultRequestHeaders(token),
    } as RequestInit;

    const nonprofitResponse = await fetch(
      `${getApiBaseUrl()}/nonprofit/${nonprofitId}`,
      requestInit,
    );
    if (!nonprofitResponse.ok) {
      throw new Error('Failed to load nonprofit.');
    }

    const nonprofitData = (await nonprofitResponse.json()) as Nonprofit;

    store.dispatch(nonprofitAdded(nonprofitData));
  } catch (error) {
    store.dispatch(
      updateAlert({
        visible: true,
        theme: 'error',
        content: 'An error occurred while loading this nonprofit.',
      }),
    );
  }
};

export const createNonprofit = async (
  nonprofit: NonprofitCreate,
  params: TypedServiceParams<Nonprofit>,
) => {
  const { success, failure } = params;

  try {
    const token = await getAuthToken();

    const nonprofitResponse = await fetch(`${getApiBaseUrl()}/nonprofit`, {
      method: 'POST',
      headers: getDefaultRequestHeaders(token),
      body: JSON.stringify(nonprofit),
    });

    if (!nonprofitResponse.ok) {
      throw new Error('Failed to create nonprofit.');
    }

    const nonprofitData = (await nonprofitResponse.json()) as Nonprofit;

    store.dispatch(nonprofitAdded(nonprofitData));

    if (success) {
      success(nonprofitData);
    }
  } catch (error) {
    const message =
      'An error occurred while saving this nonprofit. Check your network connection and try again.';

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
  }
};

export const updateNonprofit = async (
  nonprofitId: string,
  nonprofitUpdate: NonprofitUpdate,
  params: TypedServiceParams<Nonprofit>,
) => {
  const { success, failure } = params;

  try {
    const token = await getAuthToken();

    const nonprofitResponse = await fetch(
      `${getApiBaseUrl()}/nonprofit/${nonprofitId}`,
      {
        method: 'PUT',
        headers: getDefaultRequestHeaders(token),
        body: JSON.stringify(nonprofitUpdate),
      },
    );

    if (!nonprofitResponse.ok) {
      throw new Error('Failed to update nonprofit.');
    }

    const nonprofitData = (await nonprofitResponse.json()) as Nonprofit;

    store.dispatch(nonprofitAdded(nonprofitData));

    if (success) {
      success(nonprofitData);
    }
  } catch (error) {
    const message =
      'An error occurred while updating this nonprofit. Check your network connection and try again.';

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
  }
};
