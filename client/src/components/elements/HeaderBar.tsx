import React, { useRef, useState } from 'react';

import { getAuth, signOut } from 'firebase/auth';

import { useAppSelector } from '../../store/hooks';
import { signedIn } from '../../store/authSlice';

import TransparentLogo from '../../assets/images/logo-transparent.png';
import { ExitToApp, Settings } from '@mui/icons-material';
import { Button, Menu, MenuItem } from '@mui/material';
import { useNavigate } from 'react-router-dom';

const HeaderBar = () => {
  const [showAccountMenu, setShowAccountMenu] = useState(false);

  const accountMenuAnchorElRef = useRef<HTMLButtonElement | null>(null);

  const auth = getAuth();
  const isAuthenticated = useAppSelector(signedIn);
  const navigate = useNavigate();

  const handleLogoButton = () => {
    navigate('/');
  };

  const toggleAccountMenu = () => {
    setShowAccountMenu(prevState => !prevState);
  };

  const handleAccountSettings = () => {
    toggleAccountMenu();
    // Do stuff
  };

  const handleSignOut = () => {
    toggleAccountMenu();
    signOut(auth).catch((e) => console.error(e));
  };

  // Build account button and menu
  const accountButton = (
    <Button
      ref={accountMenuAnchorElRef}
      variant="text"
      color="primary"
      aria-controls={showAccountMenu ? 'account-menu' : undefined}
      aria-haspopup="true"
      aria-expended={showAccountMenu ? 'true' : undefined}
      onClick={toggleAccountMenu}
    >
      <span className="standardButtonText">
        Account
      </span>
    </Button>
  );

  const accountMenu = (
    <Menu
      id="accountMenu"
      anchorEl={accountMenuAnchorElRef.current}
      open={showAccountMenu}
      onClose={toggleAccountMenu}
      MenuListProps={{
        'aria-labelledby': 'accountButton'
      }}
    >
      <MenuItem onClick={handleAccountSettings}>
        <Settings />
        <span className="menuOptionLabel">
          Settings
        </span>
      </MenuItem>
      <MenuItem onClick={handleSignOut}>
        <ExitToApp />
        <span className="menuOptionLabel">
          Sign Out
        </span> 
      </MenuItem>
    </Menu>
  );

  return (
    <header className="headerBar">
      <div className="logoButtonContainer">
        <button type="button" onClick={handleLogoButton}>
          <img src={TransparentLogo} alt="Logo" />
        </button>
      </div>
      <div className="accountButtonContainer">
        {isAuthenticated && (
          <>
            {accountButton}
            {accountMenu}
          </>
        )}
      </div>
    </header>
  );
};

export default HeaderBar;