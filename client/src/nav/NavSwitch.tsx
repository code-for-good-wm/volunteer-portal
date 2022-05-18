import React from 'react';
import { BrowserRouter } from 'react-router-dom';

import { useIsAuthenticated } from '@azure/msal-react';

import Private from './Private';
import Public from './Public';


const NavSwitch = () => {
  const isAuthenticated = useIsAuthenticated();
  const navStack = isAuthenticated ? <Private /> : <Public />;

  return (
    <BrowserRouter>
      {navStack}
    </BrowserRouter>
  );
};

export default NavSwitch;