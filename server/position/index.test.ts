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
  positionStore: {
    list: vi.fn(),
    listByProject: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
}));

import { checkAuthAndConnect } from '../lib/helpers';
import { userStore, projectStore, positionStore } from '../lib/models/store';
import httpTrigger from './index';

const mockCheckAuthAndConnect = vi.mocked(checkAuthAndConnect);
const mockUserList = vi.mocked(userStore.list);
const mockProjectList = vi.mocked(projectStore.list);
const mockPositionCreate = vi.mocked(positionStore.create);

describe('position/index httpTrigger POST', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockCheckAuthAndConnect.mockResolvedValue({ uid: 'firebase-uid' });
  });

  it('forbids callers without position-edit permission', async () => {
    mockUserList.mockResolvedValue({ userRole: UserRole.VOLUNTEER } as never);
    const context = createMockContext({ bindingData: { projectId: 'p1' } });

    await httpTrigger(
      context,
      createMockRequest({ method: 'POST', body: { slotCount: 2 } }),
    );

    expect(context.res?.status).toBe(403);
    expect(mockPositionCreate).not.toHaveBeenCalled();
  });

  it('returns 404 when the parent project does not exist', async () => {
    mockUserList.mockResolvedValue({ userRole: UserRole.ADMIN } as never);
    mockProjectList.mockResolvedValue(null);
    const context = createMockContext({ bindingData: { projectId: 'p1' } });

    await httpTrigger(
      context,
      createMockRequest({ method: 'POST', body: { slotCount: 2 } }),
    );

    expect(context.res?.status).toBe(404);
    expect(mockPositionCreate).not.toHaveBeenCalled();
  });

  it('creates a position under the project for an authorized caller', async () => {
    mockUserList.mockResolvedValue({ userRole: UserRole.ADMIN } as never);
    mockProjectList.mockResolvedValue({ _id: 'p1' } as never);
    mockPositionCreate.mockResolvedValue({ _id: 'new-position' } as never);
    const request = createMockRequest({
      method: 'POST',
      body: { slotCount: 2 },
    });
    const context = createMockContext({
      bindingData: { projectId: 'p1' },
      req: request,
    });

    await httpTrigger(context, request);

    expect(mockPositionCreate).toHaveBeenCalledWith({
      slotCount: 2,
      project: 'p1',
    });
    expect(context.res?.status).toBe(201);
  });
});
