import React from 'react';
import logo from './logo.svg';
import './App.css';

import { useIsAuthenticated, useMsal } from '@azure/msal-react';
import { loginRequest } from './authConfig';
import { IPublicClientApplication } from '@azure/msal-browser';

function App() {
  const { instance } = useMsal();
  const isAuthenticated = useIsAuthenticated();

  const signIn = (instance: IPublicClientApplication) => {
    instance.loginRedirect(loginRequest).catch((e) => console.error(e));
  };

  const signOut = (instance: IPublicClientApplication) => {
    instance.logoutRedirect().catch((e) => console.error(e));
  };

  // Build button
  const authButton = isAuthenticated ? (
    <button type="button" onClick={() => signOut(instance)}>
      Sign In
    </button>
  ) : (
    <button type="button" onClick={() => signIn(instance)}>
      Sign In
    </button>
  );

  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <p>
          Edit <code>src/App.tsx</code> and save to reload.
        </p>
        {authButton}
      </header>
    </div>
  );
}

export default App;
