import { useEffect, useRef, useState } from "react";

import { getAuth, signOut } from "firebase/auth";

import { useAppSelector } from "../../store/hooks";
import { signedIn, user } from "../../store/authSlice";

import TransparentLogo from "../../assets/images/logo-transparent.png";
import ExitToApp from "@mui/icons-material/ExitToApp";
import Settings from "@mui/icons-material/Settings";
import CalendarMonthOutlined from "@mui/icons-material/CalendarMonthOutlined";
import EventOutlined from "@mui/icons-material/EventOutlined";
import SupervisedUserCircleOutlined from "@mui/icons-material/SupervisedUserCircleOutlined";
import VolunteerActivismOutlined from "@mui/icons-material/VolunteerActivismOutlined";
import { Button, Menu, MenuItem } from "@mui/material";
import { useNavigate } from "react-router-dom";

const HeaderBar = () => {
  const [showAccountMenu, setShowAccountMenu] = useState(false);
  const [showUsersOption, setShowUsersOption] = useState(false);
  const [showProgramsOption, setShowProgramsOption] = useState(false);
  const [showEventsOption, setShowEventsOption] = useState(false);
  const [showNonprofitsOption, setShowNonprofitsOption] = useState(false);

  const accountMenuAnchorElRef = useRef<HTMLButtonElement | null>(null);

  const auth = getAuth();
  const isAuthenticated = useAppSelector(signedIn);
  const currentUser = useAppSelector(user);

  useEffect(() => {
    const isAdminOrBoardmember = ["boardmember", "admin"].includes(
      currentUser?.userRole ?? "volunteer",
    );
    setShowUsersOption(isAdminOrBoardmember);
    setShowProgramsOption(isAdminOrBoardmember);
    setShowEventsOption(isAdminOrBoardmember);
    setShowNonprofitsOption(isAdminOrBoardmember);
  }, [currentUser]);

  const navigate = useNavigate();

  const toggleAccountMenu = () => {
    setShowAccountMenu((prevState) => !prevState);
  };

  const handleAccountSettings = () => {
    toggleAccountMenu();
    navigate("/account");
  };

  const handlePrograms = () => {
    toggleAccountMenu();
    navigate("/programs");
  };

  const handleUsers = () => {
    toggleAccountMenu();
    navigate("/users");
  };

  const handleEvents = () => {
    toggleAccountMenu();
    navigate("/events");
  };

  const handleNonprofits = () => {
    toggleAccountMenu();
    navigate("/nonprofits");
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
      aria-controls={showAccountMenu ? "account-menu" : undefined}
      aria-haspopup="true"
      aria-expanded={showAccountMenu ? "true" : undefined}
      onClick={toggleAccountMenu}
    >
      <span className="standardButtonText">Account</span>
    </Button>
  );

  const accountMenu = (
    <Menu
      id="accountMenu"
      anchorEl={accountMenuAnchorElRef.current}
      open={showAccountMenu}
      onClose={toggleAccountMenu}
      aria-label="Account Menu"
    >
      <MenuItem onClick={handleAccountSettings} aria-label="Settings">
        <Settings />
        <span className="menuOptionLabel">Settings</span>
      </MenuItem>

      {showEventsOption && (
        <MenuItem onClick={handleEvents} aria-label="Events">
          <EventOutlined />
          <span className="menuOptionLabel">Events</span>
        </MenuItem>
      )}

      {showProgramsOption && (
        <MenuItem onClick={handlePrograms} aria-label="Programs">
          <CalendarMonthOutlined />
          <span className="menuOptionLabel">Programs</span>
        </MenuItem>
      )}

      {showUsersOption && (
        <MenuItem onClick={handleUsers} aria-label="Users">
          <SupervisedUserCircleOutlined />
          <span className="menuOptionLabel">Users</span>
        </MenuItem>
      )}

      {showNonprofitsOption && (
        <MenuItem onClick={handleNonprofits} aria-label="Nonprofits">
          <VolunteerActivismOutlined />
          <span className="menuOptionLabel">Nonprofits</span>
        </MenuItem>
      )}

      <MenuItem onClick={handleSignOut} aria-label="Sign Out">
        <ExitToApp />
        <span className="menuOptionLabel">Sign Out</span>
      </MenuItem>
    </Menu>
  );

  return (
    <header className="headerBar">
      <div className="logoButtonContainer">
        <a type="button" href="/">
          <img
            src={TransparentLogo}
            alt="Code for Good - Go to Volunteer Portal home page"
          />
        </a>
      </div>
      <div className="siteNameContainer" aria-hidden>
        VOLUNTEER PORTAL
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
