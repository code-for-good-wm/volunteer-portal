import { ReactNode } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import { Provider } from 'react-redux';
import { MemoryRouter, Route, Routes } from 'react-router-dom';

vi.mock('../../../layouts/PageLayout', () => ({
  default: ({ children }: { children: ReactNode }) => <>{children}</>,
}));
vi.mock('../../../services/users', () => ({
  getUsersData: vi.fn(),
  getProfilesData: vi.fn(),
  loadUserSkills: vi.fn(),
  loadUserAttendance: vi.fn(),
}));
vi.mock('../../../services/event', () => ({ loadAllEvents: vi.fn() }));

import UserDetail from './UserDetail';
import { store } from '../../../store/store';
import { updateUsers } from '../../../store/usersSlice';
import { eventsReceived } from '../../../store/eventsSlice';
import {
  getProfilesData,
  getUsersData,
  loadUserAttendance,
  loadUserSkills,
} from '../../../services/users';
import { User } from '../../../types/user';
import { Profile } from '../../../types/profile';

const user: User = {
  _id: 'u1',
  firstName: 'Ada',
  lastName: 'Lovelace',
  email: 'ada@example.com',
  phone: '6165551234',
  userRole: 'volunteer',
};

const profile: Profile = {
  user: 'u1',
  roles: ['developer', 'lead'],
  preferredName: 'Ada',
  pronouns: 'she/her',
  currentEmployer: 'Analytical Engines',
  linkedInUrl: 'linkedin.com/in/ada',
  previousVolunteer: true,
  teamLeadCandidate: false,
  shirtSize: 'medium',
  dietaryRestrictions: ['vegan', 'nuts'],
  additionalDietaryRestrictions: '',
  agreements: { photoRelease: '2026-05-01T12:00:00.000Z' },
  skills: [],
  additionalSkills: 'Mathematics',
};

const renderAt = (userId: string) =>
  render(
    <Provider store={store}>
      <MemoryRouter initialEntries={[`/users/${userId}`]}>
        <Routes>
          <Route path="/users/:userId" element={<UserDetail />} />
        </Routes>
      </MemoryRouter>
    </Provider>,
  );

const card = (name: string) => screen.getByRole('region', { name });

describe('UserDetail', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    store.dispatch(updateUsers({ users: [user], profiles: [profile] }));
    vi.mocked(loadUserSkills).mockResolvedValue([
      { code: 'python', level: 3 },
      { code: 'java', level: 0 },
    ] as never);
    vi.mocked(loadUserAttendance).mockResolvedValue([
      {
        _id: 'a1',
        user: 'u1',
        event: 'e1',
        attendance: 'partial-attending',
        attendanceDetail: 'Saturday only',
      },
    ] as never);
  });

  it('shows who the user is', async () => {
    renderAt('u1');

    expect(
      screen.getByRole('heading', { name: 'Ada Lovelace' }),
    ).toBeInTheDocument();
    expect(screen.getByText('Volunteer')).toBeInTheDocument();
    expect(screen.getByText('Goes by Ada · she/her')).toBeInTheDocument();
    expect(screen.getByText('Developer')).toBeInTheDocument();
    expect(screen.getByText('Team lead')).toBeInTheDocument();
    await screen.findByText('Saturday only');
  });

  it('shows contact details and links', async () => {
    renderAt('u1');

    const contact = card('Ada Lovelace');
    expect(
      within(contact).getByRole('link', { name: 'ada@example.com' }),
    ).toHaveAttribute('href', 'mailto:ada@example.com');
    expect(contact).toHaveTextContent('(616) 555-1234');
    expect(
      within(contact).getByRole('link', { name: 'linkedin.com/in/ada' }),
    ).toHaveAttribute('href', 'https://linkedin.com/in/ada');
    await screen.findByText('Saturday only');
  });

  it('leaves out fields the user left blank', async () => {
    renderAt('u1');

    const contact = card('Ada Lovelace');
    expect(contact).not.toHaveTextContent('Website');
    expect(contact).not.toHaveTextContent('Portfolio');
    expect(card('Event needs')).not.toHaveTextContent('Accessibility');
    expect(card('Volunteer profile')).toHaveTextContent(
      'Profile completedNot completed',
    );
    await screen.findByText('Saturday only');
  });

  it('says so when there are no event needs', async () => {
    store.dispatch(
      updateUsers({
        users: [user],
        profiles: [
          {
            ...profile,
            shirtSize: undefined,
            dietaryRestrictions: [],
          } as never,
        ],
      }),
    );
    renderAt('u1');

    expect(card('Event needs')).toHaveTextContent('Nothing provided yet.');
    await screen.findByText('Saturday only');
  });

  it('shows event needs, agreements and profile answers', async () => {
    renderAt('u1');

    expect(card('Event needs')).toHaveTextContent(
      /Dietary restrictions.*Vegan/,
    );
    expect(card('Agreements')).toHaveTextContent('Photo releaseMay 1, 2026');
    expect(card('Agreements')).toHaveTextContent('Code of conductNot signed');
    expect(card('Volunteer profile')).toHaveTextContent(
      'Previous volunteerYes',
    );
    expect(card('Volunteer profile')).toHaveTextContent(
      'Team lead candidateNo',
    );
    await screen.findByText('Saturday only');
  });

  it('groups the rated skills by level, strongest first', async () => {
    vi.mocked(loadUserSkills).mockResolvedValue([
      { code: 'python', level: 3 },
      { code: 'frontEndDev', level: 4 },
      { code: 'java', level: 0 },
    ] as never);
    renderAt('u1');

    const skills = card('Skills');
    const dailyUse = await within(skills).findByRole('group', {
      name: 'Daily Use',
    });
    const veryFamiliar = within(skills).getByRole('group', {
      name: 'Very Familiar',
    });
    expect(
      dailyUse.compareDocumentPosition(veryFamiliar) &
        Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();
    expect(veryFamiliar).toHaveTextContent('Python');
    expect(
      within(skills).queryByRole('group', { name: 'Familiar' }),
    ).not.toBeInTheDocument();
    expect(within(skills).queryByText(/^Java/)).not.toBeInTheDocument();
    expect(loadUserSkills).toHaveBeenCalledWith('u1');
  });

  it('labels each skill with its category, once', async () => {
    vi.mocked(loadUserSkills).mockResolvedValue([
      { code: 'frontEndDev', level: 2 },
    ] as never);
    renderAt('u1');

    const skills = card('Skills');
    expect(
      await within(skills).findByLabelText('Front End Dev (Technical)'),
    ).toBeInTheDocument();
    expect(within(skills).getAllByText('Front End Dev')).toHaveLength(1);
    const legend = within(skills).getByRole('list', {
      name: 'Skill categories',
    });
    expect(legend).toHaveTextContent('Technical');
    expect(legend).not.toHaveTextContent('Design');
  });

  it('shows free-text skills only when they were filled in', async () => {
    renderAt('u1');

    const skills = card('Skills');
    await within(skills).findByText('Python');
    expect(skills).toHaveTextContent('Additional skillsMathematics');
    expect(skills).not.toHaveTextContent('AI skills');
  });

  it("shows the user's availability for each event", async () => {
    store.dispatch(
      eventsReceived({
        events: [{ _id: 'e1', name: 'Weekend for Good 2026' }],
      } as never),
    );
    renderAt('u1');

    const response = await within(card('Event availability')).findByLabelText(
      'Weekend for Good 2026',
    );
    expect(response).toHaveTextContent('Partly available');
    expect(response).toHaveTextContent('Saturday only');
  });

  it('says so when the user does not exist', () => {
    renderAt('missing');

    expect(screen.getByText('User not found.')).toBeInTheDocument();
  });

  it('loads users when opened directly', () => {
    store.dispatch(updateUsers({ users: null, profiles: null }));
    vi.mocked(getUsersData).mockResolvedValue(true);
    vi.mocked(getProfilesData).mockResolvedValue(true);

    renderAt('u1');

    expect(getUsersData).toHaveBeenCalled();
    expect(screen.getByText('Loading…')).toBeInTheDocument();
  });
});
