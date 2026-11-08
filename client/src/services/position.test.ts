import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('./slot', () => ({ loadSlotsForPosition: vi.fn() }));
vi.mock('../helpers/functions', async (importOriginal) => ({
  ...(await importOriginal<typeof import('../helpers/functions')>()),
  getAuthToken: async () => 'token',
  getApiBaseUrl: () => 'http://api.test',
}));

import { createPosition, deletePosition, updatePosition } from './position';
import { store } from '../store/store';
import { selectPositionById } from '../store/positionsSlice';

describe('createPosition', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('posts the position to the project and stores the result', async () => {
    const saved = {
      _id: 'pos-1',
      project: 'project-1',
      role: 'designer',
      slotCount: 3,
    };
    vi.mocked(fetch).mockResolvedValue(
      new Response(JSON.stringify(saved), { status: 201 }),
    );

    const result = await createPosition('project-1', {
      role: 'designer',
      slotCount: 3,
    });

    expect(result).toEqual(saved);
    const [url, init] = vi.mocked(fetch).mock.calls[0];
    expect(url).toBe('http://api.test/project/project-1/position');
    expect(init?.method).toBe('POST');
    expect(JSON.parse(init?.body as string)).toEqual({
      role: 'designer',
      slotCount: 3,
    });
    expect(selectPositionById(store.getState(), 'pos-1')).toEqual(saved);
  });

  it('shows an error and returns null when the server rejects it', async () => {
    vi.mocked(fetch).mockResolvedValue(
      new Response(JSON.stringify({ error: { message: 'Bad' } }), {
        status: 400,
      }),
    );

    const result = await createPosition('project-1', {
      role: 'designer',
      slotCount: 0,
    });

    expect(result).toBeNull();
    expect(store.getState().alert).toMatchObject({
      visible: true,
      theme: 'error',
    });
  });
});

describe('updatePosition', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('puts the changes to the position and stores the result', async () => {
    const saved = { _id: 'pos-2', project: 'p1', role: 'lead', slotCount: 1 };
    vi.mocked(fetch).mockResolvedValue(
      new Response(JSON.stringify(saved), { status: 200 }),
    );

    const result = await updatePosition('p1', 'pos-2', {
      role: 'lead',
      slotCount: 1,
    });

    expect(result).toEqual(saved);
    const [url, init] = vi.mocked(fetch).mock.calls[0];
    expect(url).toBe('http://api.test/project/p1/position/pos-2');
    expect(init?.method).toBe('PUT');
    expect(selectPositionById(store.getState(), 'pos-2')).toEqual(saved);
  });

  it("shows the server's reason when the update is refused", async () => {
    vi.mocked(fetch).mockResolvedValue(
      new Response(
        JSON.stringify({ error: { message: 'It needs at least 2 slots.' } }),
        { status: 400 },
      ),
    );

    const result = await updatePosition('p1', 'pos-2', {
      role: 'lead',
      slotCount: 1,
    });

    expect(result).toBeNull();
    expect(store.getState().alert.content).toBe(
      "Couldn't save this position. It needs at least 2 slots.",
    );
  });
});

describe('deletePosition', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('deletes the position and drops it from the store', async () => {
    vi.mocked(fetch)
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            _id: 'pos-3',
            project: 'p1',
            role: 'support',
            slotCount: 1,
          }),
          { status: 201 },
        ),
      )
      .mockResolvedValueOnce(new Response(null, { status: 202 }));
    await createPosition('p1', { role: 'support', slotCount: 1 });

    const result = await deletePosition('p1', 'pos-3');

    expect(result).toBe(true);
    const [url, init] = vi.mocked(fetch).mock.calls[1];
    expect(url).toBe('http://api.test/project/p1/position/pos-3');
    expect(init?.method).toBe('DELETE');
    expect(selectPositionById(store.getState(), 'pos-3')).toBeUndefined();
  });

  it("shows the server's reason when the delete is refused", async () => {
    vi.mocked(fetch).mockResolvedValue(
      new Response(
        JSON.stringify({ error: { message: 'People are in it.' } }),
        { status: 409 },
      ),
    );

    const result = await deletePosition('p1', 'pos-3');

    expect(result).toBe(false);
    expect(store.getState().alert.content).toBe(
      "Couldn't delete this position. People are in it.",
    );
  });
});
