import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@firebase/auth', () => ({
  getAuth: () => ({ currentUser: { getIdToken: async () => 'token' } }),
}));

import { exportUsersAndProfilesData } from './users';
import { store } from '../store/store';

const jsonResponse = (status: number, body: unknown) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });

describe('exportUsersAndProfilesData', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('passes a successful response to success', async () => {
    const response = new Response('id,email\n', { status: 200 });
    vi.mocked(fetch).mockResolvedValue(response);
    const success = vi.fn();
    const failure = vi.fn();

    await exportUsersAndProfilesData({ success, failure });

    await vi.waitFor(() => expect(success).toHaveBeenCalledWith(response));
    expect(failure).not.toHaveBeenCalled();
  });

  it('reports an error response instead of downloading it', async () => {
    vi.mocked(fetch).mockResolvedValue(
      jsonResponse(500, { error: { code: 500, message: 'Database down' } }),
    );
    const success = vi.fn();
    const failure = vi.fn();

    await exportUsersAndProfilesData({ success, failure });

    await vi.waitFor(() =>
      expect(failure).toHaveBeenCalledWith(
        'Unable to export user data: Database down',
      ),
    );
    expect(success).not.toHaveBeenCalled();
    expect(store.getState().alert).toMatchObject({
      visible: true,
      theme: 'error',
      content: 'Unable to export user data: Database down',
    });
  });
});
