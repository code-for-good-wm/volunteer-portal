import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  createMockContext,
  createMockRequest,
} from '../lib/test-utils/mockContext';
import { UserRole } from '../lib/models/enums/user-role.enum';

vi.mock('../lib/helpers', () => ({
  checkAuthAndConnect: vi.fn(),
  tryParseDateToISO: (value: string) => value,
}));
vi.mock('../lib/models/store', () => ({
  userStore: { list: vi.fn() },
  eventStore: {
    list: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
}));

import { checkAuthAndConnect } from '../lib/helpers';
import { userStore, eventStore } from '../lib/models/store';
import httpTrigger from './index';

const mockCheckAuthAndConnect = vi.mocked(checkAuthAndConnect);
const mockUserList = vi.mocked(userStore.list);
const mockEventList = vi.mocked(eventStore.list);
const mockEventCreate = vi.mocked(eventStore.create);
const mockEventUpdate = vi.mocked(eventStore.update);
const mockEventDelete = vi.mocked(eventStore.delete);

describe('event/index httpTrigger', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockCheckAuthAndConnect.mockResolvedValue({ uid: 'firebase-uid' });
  });

  describe('GET', () => {
    it('returns 404 when no eventId is provided in the route', async () => {
      const context = createMockContext({ bindingData: {} });

      await httpTrigger(context, createMockRequest({ method: 'GET' }));

      expect(context.res?.status).toBe(404);
      expect(mockEventList).not.toHaveBeenCalled();
    });

    it('returns 404 when the event does not exist', async () => {
      mockEventList.mockResolvedValue(null);
      const context = createMockContext({ bindingData: { eventId: 'e1' } });

      await httpTrigger(context, createMockRequest({ method: 'GET' }));

      expect(context.res?.status).toBe(404);
    });

    it('returns the event on success', async () => {
      mockEventList.mockResolvedValue({ _id: 'e1', name: 'Test' } as never);
      const context = createMockContext({ bindingData: { eventId: 'e1' } });

      await httpTrigger(context, createMockRequest({ method: 'GET' }));

      expect(context.res?.status).toBe(200);
      expect(context.res?.body).toEqual({ _id: 'e1', name: 'Test' });
    });
  });

  describe('POST', () => {
    it('forbids callers without event-edit permission', async () => {
      mockUserList.mockResolvedValue({
        userRole: UserRole.VOLUNTEER,
      } as never);
      const context = createMockContext();

      await httpTrigger(
        context,
        createMockRequest({ method: 'POST', body: {} }),
      );

      expect(context.res?.status).toBe(403);
      expect(mockEventCreate).not.toHaveBeenCalled();
    });

    it('creates an event for an authorized caller', async () => {
      mockUserList.mockResolvedValue({
        userRole: UserRole.ADMIN,
      } as never);
      mockEventCreate.mockResolvedValue({ _id: 'new-event' } as never);
      const request = createMockRequest({
        method: 'POST',
        body: { name: 'New Event' },
      });
      const context = createMockContext({ req: request });

      await httpTrigger(context, request);

      expect(mockEventCreate).toHaveBeenCalledWith({ name: 'New Event' });
      expect(context.res?.status).toBe(201);
    });
  });

  describe('PUT', () => {
    it('updates an existing event for an authorized caller', async () => {
      mockUserList.mockResolvedValue({
        userRole: UserRole.ADMIN,
      } as never);
      mockEventList.mockResolvedValue({ _id: 'e1' } as never);
      mockEventUpdate.mockResolvedValue({
        _id: 'e1',
        name: 'Updated Event',
      } as never);
      const request = createMockRequest({
        method: 'PUT',
        body: { name: 'Updated Event' },
      });
      const context = createMockContext({
        bindingData: { eventId: 'e1' },
        req: request,
      });

      await httpTrigger(context, request);

      expect(mockEventUpdate).toHaveBeenCalledWith('e1', {
        name: 'Updated Event',
      });
      expect(context.res?.status).toBe(200);
    });

    it('returns 404 when updating a non-existent event', async () => {
      mockUserList.mockResolvedValue({
        userRole: UserRole.ADMIN,
      } as never);
      mockEventList.mockResolvedValue(null);
      const context = createMockContext({ bindingData: { eventId: 'e1' } });

      await httpTrigger(
        context,
        createMockRequest({ method: 'PUT', body: {} }),
      );

      expect(context.res?.status).toBe(404);
      expect(mockEventUpdate).not.toHaveBeenCalled();
    });
  });

  describe('DELETE', () => {
    it('deletes an existing event for an authorized caller', async () => {
      mockUserList.mockResolvedValue({
        userRole: UserRole.BOARDMEMBER,
      } as never);
      mockEventList.mockResolvedValue({ _id: 'e1' } as never);
      const context = createMockContext({ bindingData: { eventId: 'e1' } });

      await httpTrigger(context, createMockRequest({ method: 'DELETE' }));

      expect(mockEventDelete).toHaveBeenCalledWith('e1');
      expect(context.res?.status).toBe(202);
    });

    it('returns 404 when deleting a non-existent event', async () => {
      mockUserList.mockResolvedValue({
        userRole: UserRole.BOARDMEMBER,
      } as never);
      mockEventList.mockResolvedValue(null);
      const context = createMockContext({ bindingData: { eventId: 'e1' } });

      await httpTrigger(context, createMockRequest({ method: 'DELETE' }));

      expect(context.res?.status).toBe(404);
      expect(mockEventDelete).not.toHaveBeenCalled();
    });
  });
});
