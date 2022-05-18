import React from 'react';

import { useMsal } from '@azure/msal-react';
import { AuthenticatedTemplate } from '@azure/msal-react';

import { getAuth, signOut } from 'firebase/auth';

import TransparentLogo from '../../assets/images/logo-transparent.png';
import TextButton from '../buttons/TextButton';

const HeaderBar = () => {
  const auth = getAuth();
  const { currentUser } = auth;

  const handleSignOut = () => {
    signOut(auth).catch((e) => console.error(e));
  };

  return (
    <header className="headerBar">
      <div className="logoContainer">
        <img src={TransparentLogo} alt="Logo" />
      </div>
      <div className="signOutButtonContainer">
        {currentUser && (
          <TextButton 
            type="button" 
            handler={handleSignOut}
            label="Sign Out"
          />
        )}
      </div>
    </header>
  );
};

export default HeaderBar;