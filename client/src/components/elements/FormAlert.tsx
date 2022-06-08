import React from 'react';

import { Alert, AlertColor, FormControl } from '@mui/material';

type FormAlertProps = {
  theme?: AlertColor,
  spacing?: 'normal' | 'tight' | 'none',
  content?: string;
};

const FormAlert = (props: FormAlertProps) => {
  const { theme, spacing, content } = props;


  const severity = theme ?? 'info';
  const text = content ?? '';

  return (
    <FormControl
      fullWidth
      margin={spacing === 'tight' ? 'dense' : spacing}
    >
      <Alert severity={severity}>
        {text}
      </Alert>
    </FormControl>
  );
};

export default FormAlert;