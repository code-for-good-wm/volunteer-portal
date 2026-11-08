import { act, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import HeaderBar from './HeaderBar';
import {
  renderWithProviders,
  resetStore,
  store,
} from '../../test-utils/render';
import { updateAuth } from '../../store/authSlice';
import { testUserData } from '../../helpers/constants';
import type { UserRole } from '../../types/user';

const { signOut } = vi.hoisted(() => ({
  signOut: vi.fn(() => Promise.resolve()),
}));
vi.mock('firebase/auth', () => ({
  getAuth: () => ({}),
  signOut,
}));

const signInAs = (userRole: UserRole) => {
  act(() => {
    store.dispatch(
      updateAuth({ signedIn: true, user: { ...testUserData, userRole } }),
    );
  });
};

const openAccountMenu = async () => {
  await userEvent
    .setup()
    .click(screen.getByRole('button', { name: 'Account' }));
  return screen.findByRole('menu');
};

const menuOptions = (menu: HTMLElement) =>
  within(menu)
    .getAllByRole('menuitem')
    .map((item) => item.getAttribute('aria-label'));

describe('HeaderBar', () => {
  beforeEach(() => {
    resetStore();
    signOut.mockClear();
  });

  it('links the logo to the home page', () => {
    renderWithProviders(<HeaderBar />);

    expect(
      screen.getByRole('link', { name: /Go to Volunteer Portal home page/ }),
    ).toHaveAttribute('href', '/');
  });

  it('hides the account menu when signed out', () => {
    renderWithProviders(<HeaderBar />);

    expect(
      screen.queryByRole('button', { name: 'Account' }),
    ).not.toBeInTheDocument();
  });

  it('shows volunteers only Settings and Sign Out', async () => {
    signInAs('volunteer');
    renderWithProviders(<HeaderBar />);

    expect(menuOptions(await openAccountMenu())).toEqual([
      'Settings',
      'Sign Out',
    ]);
  });

  it.each(['admin', 'boardmember'] as const)(
    'shows %s the management pages (but not Programs, which is disabled)',
    async (role) => {
      signInAs(role);
      renderWithProviders(<HeaderBar />);

      expect(menuOptions(await openAccountMenu())).toEqual([
        'Settings',
        'Events',
        'Users',
        'Nonprofits',
        'Projects',
        'Sign Out',
      ]);
    },
  );

  it('navigates to the chosen page and closes the menu', async () => {
    const user = userEvent.setup();
    signInAs('admin');
    renderWithProviders(<HeaderBar />);

    await user.click(
      within(await openAccountMenu()).getByRole('menuitem', { name: 'Users' }),
    );

    await vi.waitFor(() => {
      expect(screen.getByTestId('location')).toHaveTextContent('/users');
      expect(screen.queryByRole('menu')).not.toBeInTheDocument();
    });
  });

  it('signs the user out', async () => {
    const user = userEvent.setup();
    signInAs('volunteer');
    renderWithProviders(<HeaderBar />);

    await user.click(
      within(await openAccountMenu()).getByRole('menuitem', {
        name: 'Sign Out',
      }),
    );

    expect(signOut).toHaveBeenCalledTimes(1);
  });

  it('points the Account button at the menu it opens', async () => {
    signInAs('volunteer');
    renderWithProviders(<HeaderBar />);

    const button = screen.getByRole('button', { name: 'Account' });
    const menu = await openAccountMenu();

    expect(button).toHaveAttribute('aria-expanded', 'true');
    const controlled = document.getElementById(
      button.getAttribute('aria-controls') ?? '',
    );
    expect(controlled).not.toBeNull();
    expect(controlled).toContainElement(menu);
  });
});
