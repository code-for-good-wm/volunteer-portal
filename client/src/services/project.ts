import { Project } from '../types/project';
import { store } from '../store/store';
import { projectsReceived } from '../store/projectsSlice';
import { updateAlert } from '../store/alertSlice';
import { getApiBaseUrl, getAuthToken, getDefaultRequestHeaders } from '../helpers/functions';

export const loadProjects = async () => {
  try {
    const token = await getAuthToken();
    const requestInit = { headers: getDefaultRequestHeaders(token) } as RequestInit;

    const projectsResponse = await fetch(`${getApiBaseUrl()}/projects`, requestInit);
    if (!projectsResponse.ok) {
      throw new Error('Failed to load projects.');
    }

    const projectsData = await projectsResponse.json() as Project[];

    store.dispatch(
      projectsReceived({
        projects: projectsData,
      })
    );
  } catch (error) {
    store.dispatch(
      updateAlert({
        visible: true,
        theme: 'error',
        content: 'An error occurred while loading projects.',
      })
    );
  }
};
