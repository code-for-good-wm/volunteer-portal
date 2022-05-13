import React from 'react';

import { useIsAuthenticated, useMsal } from '@azure/msal-react';
import { loginRequest } from '../authConfig';
import { IPublicClientApplication } from '@azure/msal-browser';

const NavSwitch = () => {
  const { instance } = useMsal();
  const isAuthenticated = useIsAuthenticated();

  const signIn = (instance: IPublicClientApplication) => {
    instance.loginRedirect(loginRequest).catch((e) => console.error(e));
  };

  const signOut = (instance: IPublicClientApplication) => {
    instance.logoutRedirect().catch((e) => console.error(e));
  };

  // Build buttons
  // Note: This is currently only used for Microsoft and GitHub accounts
  const signInButton = (
    <button type="button" onClick={() => signIn(instance)}>
      Sign In
    </button>
  );
  
  const signOutButton = (
    <button type="button" onClick={() => signOut(instance)}>
      Sign Out
    </button>
  );

  return (
    <div>
      { isAuthenticated ? signOutButton : signInButton }
    </div>
  );
};

export default NavSwitch;