import React from 'react';

import { Alert, AlertColor, Snackbar } from '@mui/material';

type SnackAlertProps = {
  visible?: boolean,
  theme?: AlertColor,
  duration?: number, // milliseconds
  content?: string;
  handler?: () => void, // fired on close
};

const SnackAlert = (props: SnackAlertProps) => {
  const { visible, theme, duration, content, handler } = props;

  const open = !!visible;
  const severity = theme ?? 'info';
  const hideDuration = duration || 3000;
  const text = content ?? '';
  const handleClose = handler ? handler : () => console.log('Alert closed.');

  return (
    <Snackbar open={open} autoHideDuration={hideDuration} onClose={handleClose}>
      <Alert onClose={handleClose} severity={severity} sx={{ width: '100%' }}>
        {text}
      </Alert>
    </Snackbar>
  );
};

export default SnackAlert;