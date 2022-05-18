import React from 'react';

import { ThemeProvider } from '@mui/material';
import { muiTheme } from './material/theme';

import NavSwitch from './nav/NavSwitch';

const App = () => {
  return (
    <ThemeProvider theme={muiTheme}>
      <NavSwitch />
    </ThemeProvider>
  );
};

export default App;
