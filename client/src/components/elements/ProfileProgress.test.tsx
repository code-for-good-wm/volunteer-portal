import { act, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it } from 'vitest';

import ProfileProgress from './ProfileProgress';
import {
  renderWithProviders,
  resetStore,
  store,
} from '../../test-utils/render';
import { updateProfile } from '../../store/profileSlice';
import { testProfileData } from '../../helpers/constants';
import type { Profile, Role } from '../../types/profile';

const profileWithRoles = (roles: Role[]): Profile => ({
  ...testProfileData,
  roles,
});

const sectionHeadings = () =>
  screen.getAllByRole('heading', { level: 2 }).map((h) => h.textContent);

describe('ProfileProgress', () => {
  beforeEach(() => {
    resetStore();
  });

  it('shows only the sections every volunteer completes when they have no roles', () => {
    store.dispatch(updateProfile({ data: profileWithRoles([]) }));
    renderWithProviders(<ProfileProgress />);

    expect(sectionHeadings()).toEqual([
      'Getting Started',
      'Additional Skillset',
    ]);
  });

  it('adds the skill sections that match the volunteer roles', () => {
    store.dispatch(
      updateProfile({ data: profileWithRoles(['developer', 'designer']) }),
    );
    renderWithProviders(<ProfileProgress />);

    expect(sectionHeadings()).toEqual([
      'Getting Started',
      'Technical Skillset',
      'Design Skillset',
      'Additional Skillset',
    ]);
  });

  it('marks the current section and the ones before it as completed', () => {
    store.dispatch(
      updateProfile({
        data: profileWithRoles(['developer']),
        currentSection: 'technical-skills',
      }),
    );
    renderWithProviders(<ProfileProgress />);

    expect(
      screen.getByRole('heading', { name: /Getting Started/ }),
    ).toHaveTextContent('Completed: Getting Started');
    expect(
      screen.getByRole('heading', { name: /Technical Skillset/ }),
    ).toHaveTextContent('Current: Technical Skillset');
    expect(
      screen.getByRole('heading', { name: /Additional Skillset/ }),
    ).not.toHaveTextContent(/Current|Completed/);
  });

  it('updates when the profile loads after the sidebar is shown', () => {
    renderWithProviders(<ProfileProgress />);
    expect(sectionHeadings()).toEqual([
      'Getting Started',
      'Additional Skillset',
    ]);

    act(() => {
      store.dispatch(updateProfile({ data: profileWithRoles(['developer']) }));
    });

    expect(sectionHeadings()).toEqual([
      'Getting Started',
      'Technical Skillset',
      'Additional Skillset',
    ]);
  });
});
