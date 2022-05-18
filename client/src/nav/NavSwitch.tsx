import React, { useEffect, useState } from 'react';
import { BrowserRouter } from 'react-router-dom';

import { getAuth, onAuthStateChanged } from 'firebase/auth'; 

import Private from './Private';
import Public from './Public';

const NavSwitch = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // Add listener for state changes
    // TODO: Implement Redux for storing auth-related data
    const auth = getAuth();
    onAuthStateChanged(auth, (fbUser) => {
      if (fbUser) {
        console.log('User is logged in: ', fbUser);
        setIsAuthenticated(true);
        // TODO: If user is authenticated, pull data for this user from our database
      } else {
        console.log('User has signed out.');
        setIsAuthenticated(false);
      }
    });
  }, []);

  const navStack = isAuthenticated ? <Private /> : <Public />;

  return (
    <BrowserRouter>
      {navStack}
    </BrowserRouter>
  );
};

export default NavSwitch;