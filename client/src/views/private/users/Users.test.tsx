import { ReactNode } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Provider } from 'react-redux';
import { MemoryRouter, Route, Routes } from 'react-router-dom';

vi.mock('../../../layouts/PageLayout', () => ({
  default: ({ children }: { children: ReactNode }) => <>{children}</>,
}));
vi.mock('../../../services/users', () => ({
  getUsersData: vi.fn(),
  getProfilesData: vi.fn(),
  exportUsersAndProfilesData: vi.fn(),
}));

import Users from './Users';
import { store } from '../../../store/store';
import { updateUsers } from '../../../store/usersSlice';
import { User } from '../../../types/user';
import { Profile } from '../../../types/profile';

const ada: User = {
  _id: 'u1',
  firstName: 'Ada',
  lastName: 'Lovelace',
  email: 'ada@example.com',
  phone: '6165551234',
  userRole: 'volunteer',
};
const grace: User = {
  _id: 'u2',
  firstName: 'Grace',
  lastName: 'Hopper',
  email: 'grace@example.com',
  phone: '',
  userRole: 'admin',
};
const adaProfile = {
  user: 'u1',
  roles: ['developer', 'lead'],
  shirtSize: 'medium',
} as Profile;

const renderUsers = () =>
  render(
    <Provider store={store}>
      <MemoryRouter initialEntries={['/users']}>
        <Routes>
          <Route path="/users" element={<Users />} />
          <Route path="/users/:userId" element={<p>User page</p>} />
        </Routes>
      </MemoryRouter>
    </Provider>,
  );

describe('Users', () => {
  beforeEach(() => {
    store.dispatch(
      updateUsers({ users: [ada, grace], profiles: [adaProfile] }),
    );
  });

  it('shows only the summary columns', () => {
    renderUsers();

    const headers = screen
      .getAllByRole('columnheader')
      .map((cell) => cell.textContent);
    expect(headers).toEqual(['Name', 'Email', 'Phone', 'Type', 'Roles', '']);
  });

  it('shows one row per user', () => {
    renderUsers();

    const row = screen.getByRole('cell', { name: 'Ada Lovelace' })
      .parentElement as HTMLElement;
    expect(row).toHaveTextContent('ada@example.com');
    expect(row).toHaveTextContent('(616) 555-1234');
    expect(row).toHaveTextContent('Volunteer');
    expect(row).toHaveTextContent('Developer, Team lead');
    expect(row).not.toHaveTextContent('Medium');
    expect(
      within(
        screen.getByRole('cell', { name: 'Grace Hopper' })
          .parentElement as HTMLElement,
      ).getByText('Admin'),
    ).toBeInTheDocument();
  });

  it('filters by name or email and pages the filtered rows', async () => {
    const user = userEvent.setup();
    renderUsers();

    await user.type(screen.getByLabelText('Search by name or email'), 'grace');

    expect(screen.queryByText('Ada Lovelace')).not.toBeInTheDocument();
    expect(screen.getByText('Grace Hopper')).toBeInTheDocument();
    expect(screen.getByText('1–1 of 1')).toBeInTheDocument();
  });

  it('opens a user', async () => {
    const user = userEvent.setup();
    renderUsers();

    await user.click(screen.getByRole('button', { name: 'Open Ada Lovelace' }));

    expect(screen.getByText('User page')).toBeInTheDocument();
  });
});
