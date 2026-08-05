import { describe, expect, it, vi } from 'vitest';
import { Types } from 'mongoose';

// helpers.ts imports fbApp from ./firebase/init at module load time, which
// would otherwise attempt real Firebase Admin initialization. Mock it before
// import so this file (and anything that transitively imports helpers.ts)
// never touches real Firebase or Mongo.
vi.mock('./firebase/init', () => ({ fbApp: {} }));

import { compareUser, getUserId, groupBy, tryParseDateToISO } from './helpers';
import { IUser } from './models/user';

describe('groupBy', () => {
  it('groups items by the provided key function', () => {
    const items = [
      { category: 'a', value: 1 },
      { category: 'b', value: 2 },
      { category: 'a', value: 3 },
    ];

    const grouped = groupBy(items, (item) => item.category);

    expect(grouped).toEqual({
      a: [
        { category: 'a', value: 1 },
        { category: 'a', value: 3 },
      ],
      b: [{ category: 'b', value: 2 }],
    });
  });

  it('ignores items whose key is null or undefined', () => {
    const items = [
      { category: 'a', value: 1 },
      { category: undefined, value: 2 },
    ];

    const grouped = groupBy(
      items,
      (item) => item.category as unknown as string,
    );

    expect(grouped).toEqual({ a: [{ category: 'a', value: 1 }] });
  });

  it('returns an empty object for an empty array', () => {
    expect(groupBy([], (item: unknown) => String(item))).toEqual({});
  });
});

describe('tryParseDateToISO', () => {
  it('converts a parseable date string to ISO format', () => {
    const result = tryParseDateToISO('2024-01-15T00:00:00.000Z');
    expect(result).toBe('2024-01-15T00:00:00.000Z');
  });

  it('returns the original string when it cannot be parsed as a date', () => {
    expect(tryParseDateToISO('not-a-date')).toBe('not-a-date');
  });

  it('returns an empty string unchanged', () => {
    expect(tryParseDateToISO('')).toBe('');
  });
});

describe('getUserId', () => {
  it('stringifies an ObjectId', () => {
    const id = new Types.ObjectId();
    expect(getUserId(id)).toBe(id.toString());
  });

  it('returns an empty string when user is undefined', () => {
    expect(getUserId(undefined)).toBe('');
  });
});

describe('compareUser', () => {
  it('compares two ObjectIds', () => {
    const id = new Types.ObjectId();
    expect(compareUser(id, id)).toBe(true);
  });

  it('extracts _id from an IUser-like object before comparing', () => {
    const id = new Types.ObjectId();
    const user = { _id: id } as unknown as IUser;
    expect(compareUser(user, id)).toBe(true);
  });

  it('returns false for different ids', () => {
    expect(compareUser(new Types.ObjectId(), new Types.ObjectId())).toBe(false);
  });
});
