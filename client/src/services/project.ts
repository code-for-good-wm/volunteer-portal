import { Project } from '../types/project';
import { store } from '../store/store';
import { projectsReceived, projectsUpserted } from '../store/projectsSlice';
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

export const loadProjectsForNonprofit = async (nonprofitId: string) => {
  try {
    const token = await getAuthToken();
    const requestInit = { headers: getDefaultRequestHeaders(token) } as RequestInit;

    const projectsResponse = await fetch(`${getApiBaseUrl()}/projects?nonprofitId=${nonprofitId}`, requestInit);
    if (!projectsResponse.ok) {
      throw new Error('Failed to load projects for this nonprofit.');
    }

    const projectsData = await projectsResponse.json() as Project[];

    store.dispatch(
      projectsUpserted({
        projects: projectsData,
      })
    );
  } catch (error) {
    store.dispatch(
      updateAlert({
        visible: true,
        theme: 'error',
        content: 'An error occurred while loading this organization\'s projects.',
      })
    );
  }
};
