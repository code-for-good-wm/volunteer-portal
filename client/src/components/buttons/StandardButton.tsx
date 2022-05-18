import React from 'react';

import { Button, ThemeProvider } from '@mui/material';
import { muiTheme } from '../../material/theme';

type StandardButtonProps = {
  type?: 'submit' | 'button',
  theme?: 'primary'
  disabled?: boolean,
  label?: string,
  handler?: () => void,
};

const StandardButton = (props: StandardButtonProps) => {
  const { type, theme, disabled, label, handler } = props;

  const buttonType = type || 'button';
  const buttonTheme = theme || 'primary';
  const handleButton = handler ? handler : () => console.log('Button clicked!');
  const buttonLabel = label || 'Button';

  return (
    <ThemeProvider theme={muiTheme}>
      <Button
        type={buttonType}
        color={buttonTheme}
        disableElevation
        fullWidth
        variant="contained"
        disabled={disabled}
        onClick={buttonType === 'submit' ? undefined : handleButton}
      >
        <span className="standardButtonText">
          {buttonLabel}
        </span>
      </Button>
    </ThemeProvider>

  );
};

export default StandardButton;