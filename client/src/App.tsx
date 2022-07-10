import React from 'react';

import { ThemeProvider } from '@mui/material';
import { muiTheme } from './material/theme';

import { store } from './store/store';
import { Provider } from 'react-redux';

import NavSwitch from './nav/NavSwitch';

const App = () => {
  return (
    <ThemeProvider theme={muiTheme}>
      <Provider store={store}>
        <NavSwitch />
      </Provider>
    </ThemeProvider>
  );
};

export default App;
