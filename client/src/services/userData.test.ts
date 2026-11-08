import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@firebase/auth', () => ({
  getAuth: () => ({ currentUser: { getIdToken: async () => 'token' } }),
}));
vi.mock('../helpers/functions', async (importOriginal) => ({
  ...(await importOriginal<typeof import('../helpers/functions')>()),
  getApiBaseUrl: () => 'http://api.test',
}));

import { loadUserAttendance, loadUserSkills } from './users';
import { store } from '../store/store';

describe("loading another user's data", () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("fetches the user's skills", async () => {
    const skills = [{ code: 'python', level: 3 }];
    vi.mocked(fetch).mockResolvedValue(
      new Response(JSON.stringify(skills), { status: 200 }),
    );

    expect(await loadUserSkills('u1')).toEqual(skills);
    expect(vi.mocked(fetch).mock.calls[0][0]).toBe(
      'http://api.test/user/u1/skills',
    );
  });

  it("fetches the user's event attendance", async () => {
    vi.mocked(fetch).mockResolvedValue(
      new Response(JSON.stringify([]), { status: 200 }),
    );

    expect(await loadUserAttendance('u1')).toEqual([]);
    expect(vi.mocked(fetch).mock.calls[0][0]).toBe(
      'http://api.test/user/u1/event-attendance',
    );
  });

  it('shows an alert and returns null when the server refuses', async () => {
    vi.mocked(fetch).mockResolvedValue(new Response(null, { status: 403 }));

    expect(await loadUserSkills('u1')).toBeNull();
    expect(store.getState().alert).toMatchObject({
      visible: true,
      theme: 'error',
      content: "Unable to load this user's skills.",
    });
  });
});
