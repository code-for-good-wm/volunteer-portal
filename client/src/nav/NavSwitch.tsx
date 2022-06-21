import React, { useEffect } from 'react';
import { BrowserRouter } from 'react-router-dom';

import { getAuth, onAuthStateChanged } from 'firebase/auth'; 

import { useAppSelector } from '../store/hooks';
import { signedIn } from '../store/authSlice';
import { handleAuthStateChange } from '../services/auth';

import ScrollToTop from './ScrollToTop';
import Private from './Private';
import Public from './Public';

const NavSwitch = () => {
  const isAuthenticated = useAppSelector(signedIn);

  useEffect(() => {
    // Add listener for state changes
    const auth = getAuth();
    onAuthStateChanged(auth, handleAuthStateChange);
  }, []);

  const navStack = isAuthenticated ? <Private /> : <Public />;

  return (
    <BrowserRouter>
      <ScrollToTop />
      {navStack}
    </BrowserRouter>
  );
};

export default NavSwitch;