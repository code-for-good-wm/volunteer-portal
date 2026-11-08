import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  createMockContext,
  createMockRequest,
} from '../lib/test-utils/mockContext';
import { defaultSkillOptions } from '../skill-options/defaults';

vi.mock('../lib/helpers', () => ({
  checkAuthAndConnect: vi.fn(),
}));

import { checkAuthAndConnect } from '../lib/helpers';
import httpTrigger from './index';

const mockCheckAuthAndConnect = vi.mocked(checkAuthAndConnect);

describe('default-skills/index httpTrigger GET', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns defaultSkillOptions', async () => {
    mockCheckAuthAndConnect.mockResolvedValue({ uid: 'firebase-uid' });
    const context = createMockContext();

    await httpTrigger(context, createMockRequest({ method: 'GET' }));

    expect(context.res?.status).toBe(200);
    expect(context.res?.body).toEqual(defaultSkillOptions);
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
