import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  createMockContext,
  createMockRequest,
} from '../lib/test-utils/mockContext';

vi.mock('../lib/helpers', () => ({
  checkAuthAndConnect: vi.fn(),
}));

import { checkAuthAndConnect } from '../lib/helpers';
import httpTrigger from './index';

const mockCheckAuthAndConnect = vi.mocked(checkAuthAndConnect);

describe('roles/index httpTrigger GET', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns the Role enum values', async () => {
    mockCheckAuthAndConnect.mockResolvedValue({ uid: 'firebase-uid' });
    const context = createMockContext();

    await httpTrigger(context, createMockRequest({ method: 'GET' }));

    expect(context.res?.status).toBe(200);
    expect(context.res?.body).toEqual([
      'designer',
      'developer',
      'support',
      'lead',
    ]);
  });

  it('returns the auth error when the caller is not authenticated', async () => {
    mockCheckAuthAndConnect.mockResolvedValue({
      result: { status: 401, body: { error: 'Unauthorized' } },
    } as never);
    const context = createMockContext();

    await httpTrigger(context, createMockRequest({ method: 'GET' }));

    expect(context.res?.status).toBe(401);
  });
});
