import { createTheme } from '@mui/material/styles';
import { colors } from './colors';

/**
 * Update existing theme settings
 * https://mui.com/material-ui/customization/palette/#adding-new-colors
 */
export const muiTheme = createTheme({
  palette: {
    primary: {
      main: colors.primary.dark,
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          height: 36
        }
      }
    }
  }
});
