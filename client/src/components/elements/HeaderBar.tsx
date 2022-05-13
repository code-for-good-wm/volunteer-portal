import React from 'react';

import { useMsal } from '@azure/msal-react';
import { AuthenticatedTemplate } from '@azure/msal-react';

import TransparentLogo from '../../assets/images/logo-transparent.png';

const HeaderBar = () => {
  const { instance } = useMsal();

  const handleSignOut = () => {
    instance.logoutRedirect().catch((e) => console.error(e));
  };

  return (
    <header className="headerBar">
      <div className="logoContainer">
        <img src={TransparentLogo} alt="Logo" />
      </div>
      <div className="signOutButtonContainer">
        <AuthenticatedTemplate>
          <button type="button" className="signOutButton" onClick={handleSignOut}>
            Sign Out
          </button>
        </AuthenticatedTemplate>
      </div>
    </header>
  );
};

export default HeaderBar;