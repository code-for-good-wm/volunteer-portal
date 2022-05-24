import React from 'react';

import { Button } from '@mui/material';

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
  );
};

export default StandardButton;