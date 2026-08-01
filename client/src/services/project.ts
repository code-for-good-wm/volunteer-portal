import { store } from '../store/store';

import { Position, Project, Slot } from '../types/project';
import { updateAlert } from '../store/alertSlice';
import { getApiBaseUrl, getAuthToken, getDefaultRequestHeaders } from '../helpers/functions';

export interface EventSlotCounts {
  confirmed: number,
  declined: number,
}

/**
 * A volunteer is "confirmed" once they've accepted a slot on a project position tied to
 * this event (SlotStatus.CONFIRMED / CONFIRMED_PARTIAL), and "declined" once they've
 * turned one down (SlotStatus.DECLINED). There's no aggregate endpoint for this, so we
 * walk projects -> positions -> slots for the event and count client-side.
 */
export const getEventSlotCounts = async (eventId: string): Promise<EventSlotCounts> => {
  const emptyCounts: EventSlotCounts = { confirmed: 0, declined: 0 };

  try {
    const token = await getAuthToken();
    const requestInit = { headers: getDefaultRequestHeaders(token) } as RequestInit;

    const projectsResponse = await fetch(`${getApiBaseUrl()}/projects?eventId=${eventId}`, requestInit);
    if (!projectsResponse.ok) {
      throw new Error('Failed to load projects for event.');
    }
    const projects = await projectsResponse.json() as Project[];

    const positionLists = await Promise.all(
      projects.map(async (project) => {
        const response = await fetch(`${getApiBaseUrl()}/project/${project._id}/position`, requestInit);
        if (!response.ok) {
          throw new Error('Failed to load positions for project.');
        }
        return await response.json() as Position[];
      })
    );
    const positions = positionLists.flat();

    const slotLists = await Promise.all(
      positions.map(async (position) => {
        const response = await fetch(`${getApiBaseUrl()}/position/${position._id}/slot`, requestInit);
        if (!response.ok) {
          throw new Error('Failed to load slots for position.');
        }
        return await response.json() as Slot[];
      })
    );
    const slots = slotLists.flat();

    return {
      confirmed: slots.filter(s => s.status === 'confirmed' || s.status === 'confirmed-partial').length,
      declined: slots.filter(s => s.status === 'declined').length,
    };
  } catch (error) {
    store.dispatch(
      updateAlert({
        visible: true,
        theme: 'error',
        content: 'An error occurred while loading project sign-up counts for this event.',
      })
    );

    return emptyCounts;
  }
};
