import { Nonprofit } from '../types/nonprofit';
import { store } from '../store/store';
import { nonprofitsReceived } from '../store/nonprofitsSlice';
import { updateAlert } from '../store/alertSlice';
import { getApiBaseUrl, getAuthToken, getDefaultRequestHeaders } from '../helpers/functions';

export const loadNonprofits = async () => {
  try {
    const token = await getAuthToken();
    const requestInit = { headers: getDefaultRequestHeaders(token) } as RequestInit;

    const nonprofitsResponse = await fetch(`${getApiBaseUrl()}/nonprofits`, requestInit);
    if (!nonprofitsResponse.ok) {
      throw new Error('Failed to load nonprofits.');
    }

    const nonprofitsData = await nonprofitsResponse.json() as Nonprofit[];

    store.dispatch(
      nonprofitsReceived({
        nonprofits: nonprofitsData,
      })
    );
  } catch (error) {
    store.dispatch(
      updateAlert({
        visible: true,
        theme: 'error',
        content: 'An error occurred while loading nonprofits.',
      })
    );
  }
};
