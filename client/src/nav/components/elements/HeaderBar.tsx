import React from 'react';

import { useMsal } from '@azure/msal-react';
import { AuthenticatedTemplate } from '@azure/msal-react';
import { IPublicClientApplication } from '@azure/msal-browser';

import TransparentLogo from '../../../assets/images/transparent-logo.png';

const HeaderBar = () => {
  const { instance } = useMsal();

  const signOut = (instance: IPublicClientApplication) => {
    instance.logoutRedirect().catch((e) => console.error(e));
  };

  return (
    <header className="headerBar">
      <div className="logoContainer">
        <img src={TransparentLogo} alt="Logo" />
      </div>
      <div className="signOutButtonContainer">
        <AuthenticatedTemplate>
          <button type="button" className="signOutButton" onClick={() => signOut(instance)}>
            Sign Out
          </button>
        </AuthenticatedTemplate>
      </div>
    </header>
  );
};

export default HeaderBar;