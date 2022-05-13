import React from 'react';

import { useIsAuthenticated, useMsal } from '@azure/msal-react';
import { loginRequest } from './authConfig';
import { IPublicClientApplication } from '@azure/msal-browser';

function App() {
  const { instance } = useMsal();
  const isAuthenticated = useIsAuthenticated();

  const signIn = (instance: IPublicClientApplication) => {
    instance.loginRedirect(loginRequest).catch((e) => console.error(e));
  };

  const signOut = (instance: IPublicClientApplication) => {
    instance.logoutRedirect().catch((e) => console.error(e));
  };

  // Build button
  // Note: This is currently only used for Microsoft and GitHub accounts
  const authButton = isAuthenticated ? (
    <button type="button" onClick={() => signOut(instance)}>
      Sign Out
    </button>
  ) : (
    <button type="button" onClick={() => signIn(instance)}>
      Sign In
    </button>
  );

  return (
    <div>
      {authButton}
    </div>
  );
}

export default App;
