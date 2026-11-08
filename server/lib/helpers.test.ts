import { beforeEach, describe, expect, it, vi } from 'vitest';
import { Types } from 'mongoose';

// helpers.ts imports fbApp from ./firebase/init at module load time, which
// would otherwise attempt real Firebase Admin initialization. Mock it before
// import so this file (and anything that transitively imports helpers.ts)
// never touches real Firebase or Mongo.
vi.mock('./firebase/init', () => ({ fbApp: {} }));
vi.mock('./models/store', () => ({
  connect: vi.fn(),
  userStore: { list: vi.fn() },
}));

import {
  checkCanReadBindingUser,
  compareUser,
  getUserId,
  groupBy,
  tryParseDateToISO,
} from './helpers';
import { userStore } from './models/store';
import { UserRole } from './models/enums/user-role.enum';
import { createMockContext } from './test-utils/mockContext';
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

describe('checkCanReadBindingUser', () => {
  const contextFor = (userId?: string) =>
    createMockContext({ bindingData: { userId } as never });

  beforeEach(() => {
    vi.mocked(userStore.list).mockReset();
  });

  it('lets a user read their own data', async () => {
    vi.mocked(userStore.list).mockResolvedValue({
      _id: 'me',
      userRole: UserRole.VOLUNTEER,
    } as never);

    const result = await checkCanReadBindingUser(contextFor('me'), 'uid');

    expect(result.status).toBe(200);
    expect(result.body._id).toBe('me');
  });

  it("forbids a volunteer from reading someone else's data", async () => {
    vi.mocked(userStore.list).mockResolvedValue({
      _id: 'me',
      userRole: UserRole.VOLUNTEER,
    } as never);

    const result = await checkCanReadBindingUser(contextFor('other'), 'uid');

    expect(result.status).toBe(403);
  });

  it.each([UserRole.ADMIN, UserRole.BOARDMEMBER])(
    "lets a %s read someone else's data",
    async (userRole) => {
      vi.mocked(userStore.list).mockResolvedValue({
        _id: 'me',
        userRole,
      } as never);

      const result = await checkCanReadBindingUser(contextFor('other'), 'uid');

      expect(result.status).toBe(200);
      expect(result.body._id).toBe('other');
    },
  );

  it('returns 404 when the caller has no user record', async () => {
    vi.mocked(userStore.list).mockResolvedValue(null);

    const result = await checkCanReadBindingUser(contextFor('other'), 'uid');

    expect(result.status).toBe(404);
  });
});
