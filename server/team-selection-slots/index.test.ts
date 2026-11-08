import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  createMockContext,
  createMockRequest,
} from '../lib/test-utils/mockContext';
import { UserRole } from '../lib/models/enums/user-role.enum';

vi.mock('../lib/helpers', () => ({
  checkAuthAndConnect: vi.fn(),
}));
vi.mock('../lib/models/store', () => ({
  userStore: { list: vi.fn() },
  projectStore: { list: vi.fn() },
  slotStore: { listByProject: vi.fn() },
}));

import { checkAuthAndConnect } from '../lib/helpers';
import { userStore, projectStore, slotStore } from '../lib/models/store';
import httpTrigger from './index';

const mockUserList = vi.mocked(userStore.list);
const mockProjectList = vi.mocked(projectStore.list);
const mockListByProject = vi.mocked(slotStore.listByProject);

describe('team-selection-slots httpTrigger GET', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(checkAuthAndConnect).mockResolvedValue({ uid: 'firebase-uid' });
  });

  it('forbids callers without team-selection permission', async () => {
    mockUserList.mockResolvedValue({ userRole: UserRole.VOLUNTEER } as never);
    const context = createMockContext({ bindingData: { projectId: 'p1' } });

    await httpTrigger(context, createMockRequest({ method: 'GET' }));

    expect(context.res?.status).toBe(403);
    expect(mockListByProject).not.toHaveBeenCalled();
  });

  it('returns 404 when the project does not exist', async () => {
    mockUserList.mockResolvedValue({ userRole: UserRole.ADMIN } as never);
    mockProjectList.mockResolvedValue(null);
    const context = createMockContext({ bindingData: { projectId: 'p1' } });

    await httpTrigger(context, createMockRequest({ method: 'GET' }));

    expect(context.res?.status).toBe(404);
  });

  it('groups assigned and unassigned slots by position role', async () => {
    mockUserList.mockResolvedValue({ userRole: UserRole.BOARDMEMBER } as never);
    mockProjectList.mockResolvedValue({ _id: 'p1' } as never);
    const dev1 = {
      _id: 's1',
      position: { role: 'developer' },
      user: { _id: 'u1' },
    };
    const dev2 = { _id: 's2', position: { role: 'developer' } };
    const designer = { _id: 's3', position: { role: 'designer' } };
    mockListByProject.mockResolvedValue([dev1, dev2, designer] as never);
    const context = createMockContext({ bindingData: { projectId: 'p1' } });

    await httpTrigger(context, createMockRequest({ method: 'GET' }));

    expect(mockListByProject).toHaveBeenCalledWith('p1');
    expect(context.res?.status).toBe(200);
    expect(context.res?.body).toEqual({
      developer: [dev1, dev2],
      designer: [designer],
    });
  });
});
