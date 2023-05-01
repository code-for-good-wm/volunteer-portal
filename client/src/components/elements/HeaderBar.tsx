import { useEffect, useRef, useState } from 'react';

import { getAuth, signOut } from 'firebase/auth';

import { useAppSelector } from '../../store/hooks';
import { signedIn, user } from '../../store/authSlice';

import TransparentLogo from '../../assets/images/logo-transparent.png';
import ExitToApp from '@mui/icons-material/ExitToApp';
import Settings from '@mui/icons-material/Settings';
import SupervisedUserCircleOutlined from '@mui/icons-material/SupervisedUserCircleOutlined';
import { Button, Menu, MenuItem } from '@mui/material';
import { useNavigate } from 'react-router-dom';

const HeaderBar = () => {
  const [showAccountMenu, setShowAccountMenu] = useState(false);
  const [showUsersOption, setShowUsersOption] = useState(false);
  const [showProgramsOption, setShowProgramsOption] = useState(false);

  const accountMenuAnchorElRef = useRef<HTMLButtonElement | null>(null);

  const auth = getAuth();
  const isAuthenticated = useAppSelector(signedIn);
  const currentUser = useAppSelector(user);

  useEffect(() => {
    const isAdminOrBoardmember = ['boardmember', 'admin'].includes(currentUser?.userRole ?? 'volunteer');
    setShowUsersOption(isAdminOrBoardmember);
    setShowProgramsOption(isAdminOrBoardmember);
  }, [currentUser]);

  const navigate = useNavigate();

  const handleLogoButton = () => {
    navigate('/');
  };

  const toggleAccountMenu = () => {
    setShowAccountMenu(prevState => !prevState);
  };

  const handleAccountSettings = () => {
    toggleAccountMenu();
    navigate('/account');
  };

  const handlePrograms = () => {
    toggleAccountMenu();
    navigate('/programs');
  };

  const handleUsers = () => {
    toggleAccountMenu();
    navigate('/users');
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
      aria-expanded={showAccountMenu ? 'true' : undefined}
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

      { showProgramsOption &&
      <MenuItem onClick={handlePrograms}>
        <SupervisedUserCircleOutlined />
        <span className="menuOptionLabel">
          Programs
        </span>
      </MenuItem> }

      { showUsersOption &&
      <MenuItem onClick={handleUsers}>
        <SupervisedUserCircleOutlined />
        <span className="menuOptionLabel">
          Users
        </span>
      </MenuItem> }

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
          <img src={TransparentLogo} alt="Code for Good Volunteer Portal" />
        </button>
      </div>
      <div className="siteNameContainer" aria-hidden>VOLUNTEER PORTAL</div>
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