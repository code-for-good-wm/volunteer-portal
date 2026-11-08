import { ReactElement } from 'react';
import { Provider } from 'react-redux';
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom';
import { render } from '@testing-library/react';

import { store } from '../store/store';
import { updateAuth } from '../store/authSlice';
import { updateProfile } from '../store/profileSlice';

/**
 * Some helpers (e.g. getDisplayedProfileSections) read the app's singleton
 * store directly, so tests use that store and reset the slices they touch.
 */
export const resetStore = () => {
  store.dispatch(updateAuth({ signedIn: false, updating: false, user: null }));
  store.dispatch(
    updateProfile({
      currentSection: null,
      data: null,
      showRegistrationComplete: false,
    }),
  );
};

/** Renders the current router path so tests can assert on navigation. */
const LocationDisplay = () => {
  const location = useLocation();
  return <div data-testid="location">{location.pathname}</div>;
};

/** Render a component inside the Redux store and a router (starting at `route`). */
export const renderWithProviders = (ui: ReactElement, route = '/') =>
  render(
    <Provider store={store}>
      <MemoryRouter initialEntries={[route]}>
        <Routes>
          <Route path="*" element={ui} />
        </Routes>
        <LocationDisplay />
      </MemoryRouter>
    </Provider>,
  );

export { store };
