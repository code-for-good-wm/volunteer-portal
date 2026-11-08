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
    countRemovableSlots: vi.fn(),
    countLockedSlots: vi.fn(),
  },
}));

import { checkAuthAndConnect } from '../lib/helpers';
import { userStore, projectStore, positionStore } from '../lib/models/store';
import httpTrigger from './index';

const mockCheckAuthAndConnect = vi.mocked(checkAuthAndConnect);
const mockUserList = vi.mocked(userStore.list);
const mockProjectList = vi.mocked(projectStore.list);
const mockPositionCreate = vi.mocked(positionStore.create);
const mockPositionList = vi.mocked(positionStore.list);
const mockPositionUpdate = vi.mocked(positionStore.update);
const mockCountRemovable = vi.mocked(positionStore.countRemovableSlots);
const mockListByProject = vi.mocked(positionStore.listByProject);

describe('position/index httpTrigger POST', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockCheckAuthAndConnect.mockResolvedValue({ uid: 'firebase-uid' });
    mockListByProject.mockResolvedValue([]);
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
      body: { role: 'developer', slotCount: 2, extra: 'ignored' },
    });
    const context = createMockContext({
      bindingData: { projectId: 'p1' },
      req: request,
    });

    await httpTrigger(context, request);

    expect(mockPositionCreate).toHaveBeenCalledWith({
      project: 'p1',
      role: 'developer',
      slotCount: 2,
      notes: undefined,
    });
    expect(context.res?.status).toBe(201);
  });

  it('refuses a second position with the same role', async () => {
    mockUserList.mockResolvedValue({ userRole: UserRole.ADMIN } as never);
    mockProjectList.mockResolvedValue({ _id: 'p1' } as never);
    mockListByProject.mockResolvedValue([
      { _id: 'existing', role: 'developer', slotCount: 3 },
    ] as never);
    const request = createMockRequest({
      method: 'POST',
      body: { role: 'developer', slotCount: 1 },
    });
    const context = createMockContext({
      bindingData: { projectId: 'p1' },
      req: request,
    });

    await httpTrigger(context, request);

    expect(context.res?.status).toBe(409);
    expect(mockPositionCreate).not.toHaveBeenCalled();
  });

  it.each([
    ['a missing role', { slotCount: 2 }],
    ['an unknown role', { role: 'wizard', slotCount: 2 }],
    ['a missing slot count', { role: 'developer' }],
    ['zero slots', { role: 'developer', slotCount: 0 }],
    ['a fractional slot count', { role: 'developer', slotCount: 1.5 }],
    ['too many slots', { role: 'developer', slotCount: 101 }],
  ])('rejects %s with a 400', async (_case, body) => {
    mockUserList.mockResolvedValue({ userRole: UserRole.ADMIN } as never);
    mockProjectList.mockResolvedValue({ _id: 'p1' } as never);
    const request = createMockRequest({ method: 'POST', body });
    const context = createMockContext({
      bindingData: { projectId: 'p1' },
      req: request,
    });

    await httpTrigger(context, request);

    expect(context.res?.status).toBe(400);
    expect(mockPositionCreate).not.toHaveBeenCalled();
  });
});

describe('position/index httpTrigger PUT', () => {
  const putRequest = (body: unknown) => {
    const request = createMockRequest({ method: 'PUT', body });
    const context = createMockContext({
      bindingData: { projectId: 'p1', positionId: 'pos1' },
      req: request,
    });
    return { request, context };
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockCheckAuthAndConnect.mockResolvedValue({ uid: 'firebase-uid' });
    mockUserList.mockResolvedValue({ userRole: UserRole.ADMIN } as never);
    mockPositionList.mockResolvedValue({
      _id: 'pos1',
      project: 'p1',
      slotCount: 3,
    } as never);
    mockListByProject.mockResolvedValue([
      { _id: 'pos1', role: 'designer', slotCount: 3 },
      { _id: 'pos2', role: 'developer', slotCount: 2 },
    ] as never);
  });

  it('refuses to change the role to one another position has', async () => {
    const { request, context } = putRequest({
      role: 'developer',
      slotCount: 3,
    });

    await httpTrigger(context, request);

    expect(context.res?.status).toBe(409);
    expect(mockPositionUpdate).not.toHaveBeenCalled();
  });

  it('updates the position and returns it', async () => {
    mockPositionUpdate.mockResolvedValue({
      _id: 'pos1',
      slotCount: 5,
    } as never);
    const { request, context } = putRequest({
      role: 'designer',
      slotCount: 5,
    });

    await httpTrigger(context, request);

    expect(mockPositionUpdate).toHaveBeenCalledWith('pos1', {
      project: 'p1',
      role: 'designer',
      slotCount: 5,
      notes: undefined,
    });
    expect(context.res?.status).toBe(200);
    expect(context.res?.body).toEqual({ _id: 'pos1', slotCount: 5 });
  });

  it('rejects an invalid update with a 400', async () => {
    const { request, context } = putRequest({ role: 'designer', slotCount: 0 });

    await httpTrigger(context, request);

    expect(context.res?.status).toBe(400);
    expect(mockPositionUpdate).not.toHaveBeenCalled();
  });

  it('lets the position shrink when enough slots are still open', async () => {
    mockCountRemovable.mockResolvedValue(2);
    mockPositionUpdate.mockResolvedValue({ _id: 'pos1' } as never);
    const { request, context } = putRequest({
      role: 'designer',
      slotCount: 1,
    });

    await httpTrigger(context, request);

    expect(context.res?.status).toBe(200);
  });

  it('refuses to remove slots that are invited or filled', async () => {
    mockCountRemovable.mockResolvedValue(1);
    const { request, context } = putRequest({
      role: 'designer',
      slotCount: 1,
    });

    await httpTrigger(context, request);

    expect(context.res?.status).toBe(400);
    expect(JSON.stringify(context.res?.body)).toContain('at least 2 slots');
    expect(mockPositionUpdate).not.toHaveBeenCalled();
  });
});

describe('position/index httpTrigger DELETE', () => {
  const mockPositionDelete = vi.mocked(positionStore.delete);
  const mockCountLocked = vi.mocked(positionStore.countLockedSlots);

  const deleteRequest = () => {
    const request = createMockRequest({ method: 'DELETE' });
    const context = createMockContext({
      bindingData: { projectId: 'p1', positionId: 'pos1' },
      req: request,
    });
    return { request, context };
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockCheckAuthAndConnect.mockResolvedValue({ uid: 'firebase-uid' });
    mockUserList.mockResolvedValue({ userRole: UserRole.ADMIN } as never);
    mockPositionList.mockResolvedValue({
      _id: 'pos1',
      project: 'p1',
      slotCount: 2,
    } as never);
  });

  it('deletes a position whose slots are all open', async () => {
    mockCountLocked.mockResolvedValue(0);
    const { request, context } = deleteRequest();

    await httpTrigger(context, request);

    expect(mockPositionDelete).toHaveBeenCalledWith('pos1');
    expect(context.res?.status).toBe(202);
  });

  it('refuses to delete a position people are invited to or confirmed in', async () => {
    mockCountLocked.mockResolvedValue(1);
    const { request, context } = deleteRequest();

    await httpTrigger(context, request);

    expect(context.res?.status).toBe(409);
    expect(JSON.stringify(context.res?.body)).toContain('1 person invited');
    expect(mockPositionDelete).not.toHaveBeenCalled();
  });

  it('forbids volunteers from deleting positions', async () => {
    mockUserList.mockResolvedValue({ userRole: UserRole.VOLUNTEER } as never);
    const { request, context } = deleteRequest();

    await httpTrigger(context, request);

    expect(context.res?.status).toBe(403);
    expect(mockPositionDelete).not.toHaveBeenCalled();
  });
});
