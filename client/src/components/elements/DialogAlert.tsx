import React from 'react';

import { Dialog } from '@mui/material';
import StandardButton from '../buttons/StandardButton';

type DialogAlertParams = {
  visible: boolean,
  title?: string,
  message?: string,
  cancelLabel?: string,
  okLabel?: string,
  hideCancel?: boolean,
  handleClose?: () => void,
  handleCancel?: () => void,
  handleOk?: () => void,
};

const DialogAlert = (params: DialogAlertParams) => {
  const {
    visible,
    title,
    message,
    cancelLabel,
    okLabel,
    hideCancel,
    handleClose,
    handleCancel,
    handleOk
  } = params;

  const titleText = title || 'Alert';
  const messageText = message || 'This is an alert.';
  const cancelButtonText = cancelLabel || 'Cancel';
  const okButtonText = okLabel || 'OK';
  const hideCancelButton = !!hideCancel;

  return (
    <Dialog
      open={visible}
      onClose={handleClose}
    >
      <div className="dialogAlert">
        <h2>
          {titleText}
        </h2>
        <div className="divider" />
        <p className="message">
          {messageText}
        </p>
        <div className="controls">
          <div className="buttonContainer">
            <StandardButton
              label={okButtonText}
              handler={handleOk}
            />
          </div>
          {!hideCancelButton && (
            <div className="buttonContainer spacing">
              <StandardButton
                theme="secondary"
                label={cancelButtonText}
                handler={handleCancel}
              />
            </div>
          )}
        </div>
      </div>
    </Dialog>
  );
};

export default DialogAlert;