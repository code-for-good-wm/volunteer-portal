import React, { useEffect } from 'react';
import { BrowserRouter } from 'react-router-dom';

import { getAuth, onAuthStateChanged } from 'firebase/auth'; 

import { useAppSelector, useAppDispatch } from '../store/hooks';
import { signedIn, updating } from '../store/authSlice';
import { alert, updateAlert } from '../store/alertSlice';
import { handleAuthStateChange } from '../services/auth';

import ScrollToTop from './ScrollToTop';
import SnackAlert from '../components/elements/SnackAlert';
import Private from './Private';
import Public from './Public';

import { Backdrop, CircularProgress } from '@mui/material';

const NavSwitch = () => {
  const isAuthenticated = useAppSelector(signedIn);
  const isUpdating = useAppSelector(updating);
  const alertOptions = useAppSelector(alert);

  const dispatch = useAppDispatch();

  useEffect(() => {
    // Add listener for state changes
    const auth = getAuth();
    onAuthStateChanged(auth, handleAuthStateChange);
  }, []);

  const handleAlertClose = () => {
    dispatch(
      updateAlert({
        visible: false,
      })
    );
  };

  const navStack = isAuthenticated ? <Private /> : <Public />;

  return (
    <BrowserRouter>
      <ScrollToTop />
      <Backdrop open={isUpdating} sx={{ backgroundColor: 'rgba(0, 0, 0, 0.1)', zIndex: 999 }}>
        <span className="primaryMain">
          <CircularProgress color="inherit" />
        </span>
      </Backdrop>
      <SnackAlert
        visible={alertOptions.visible}
        theme={alertOptions.theme}
        duration={alertOptions.duration}
        content={alertOptions.content}
        handler={handleAlertClose}
      />
      {navStack}
    </BrowserRouter>
  );
};

export default NavSwitch;