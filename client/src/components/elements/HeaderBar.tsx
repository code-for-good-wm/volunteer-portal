import React from 'react';

import { getAuth, signOut } from 'firebase/auth';

import { useAppSelector } from '../../store/hooks';
import { signedIn } from '../../store/authSlice';

import TransparentLogo from '../../assets/images/logo-transparent.png';
import TextButton from '../buttons/TextButton';
import { useNavigate } from 'react-router-dom';

const HeaderBar = () => {
  const auth = getAuth();
  const isAuthenticated = useAppSelector(signedIn);
  const navigate = useNavigate();

  const handleLogoButton = () => {
    navigate('/');
  };

  const handleSignOut = () => {
    signOut(auth).catch((e) => console.error(e));
  };

  return (
    <header className="headerBar">
      <div className="logoButtonContainer">
        <button type="button" onClick={handleLogoButton}>
          <img src={TransparentLogo} alt="Logo" />
        </button>
      </div>
      <div className="signOutButtonContainer">
        {isAuthenticated && (
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