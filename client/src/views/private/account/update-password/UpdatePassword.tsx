import React, { ChangeEvent, FormEvent, useEffect, useState } from 'react';

import { FormAlertState } from '../../../../types/forms';

import TextFieldLabel from '../../../../components/elements/TextFieldLabel';
import StandardButton from '../../../../components/buttons/StandardButton';
import FormAlert from '../../../../components/elements/FormAlert';

import { FormControl, TextField } from '@mui/material';

import { testPassword } from '../../../../helpers/validation';
import { updateUserPassword } from '../../../../services/account';


type UpdatePasswordForm = {
  password: string,
  newPassword: string
};

const UpdatePassword = () => {
  const [submitDisabled, setSubmitDisabled] = useState(true);
  const [form, setForm] = useState<UpdatePasswordForm>({
    password: '',
    newPassword: ''
  });
  const [alert, setAlert] = useState<FormAlertState>({
    show: false,
    text: '',
  });
  const [processing, setProcessing] = useState(false);

  // Test for form validity
  useEffect(() => {
    const passwordTrimmed = form.password.trim();
    const newPasswordTrimmed = form.newPassword.trim();

    if (passwordTrimmed && testPassword(newPasswordTrimmed)) {
      setSubmitDisabled(false);
    } else {
      setSubmitDisabled(true);
    }
  }, [form]);

  const resetAlert = () => {
    setAlert({
      show: false,
      text: '',
    });
  };

  const handlePassword = (event: ChangeEvent<HTMLInputElement>) => {
    const { value } = event.target;
    setForm((prevState) => ({
      ...prevState,
      password: value,
    }));
    if (alert.show) {
      resetAlert();
    }
  };

  const handleNewPassword = (event: ChangeEvent<HTMLInputElement>) => {
    const { value } = event.target;
    setForm((prevState) => ({
      ...prevState,
      newPassword: value,
    }));
    if (alert.show) {
      resetAlert();
    }
  };

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();

    const passwordTrimmed = form.password.trim();
    const newPasswordTrimmed = form.newPassword.trim();

    // Test to see if the entered passwords are the same
    if (passwordTrimmed === newPasswordTrimmed) {
      setAlert({
        show: true,
        text: 'The new password must be different than your current password.',
        severity: 'error'
      });
      return;
    }

    // Build callbacks
    const success = () => {
      setProcessing(false);
      setForm((prevState) => ({
        ...prevState,
        password: '',
        newPassword: ''
      }));
      setAlert({
        show: true,
        text: 'Password updated sucessfully.',
        severity: 'success'
      });
    };

    const failure = (message: string) => {
      setProcessing(false);
      setAlert({
        show: true,
        text: message,
        severity: 'error'
      });
    };

    // Attempt update
    setProcessing(true);
    updateUserPassword({
      password: passwordTrimmed,
      newPassword: newPasswordTrimmed,
      success,
      failure,
    });
  };

  return (
    <div className="contentCard accountCard">
      <h2>
        Update Password
      </h2>
      <div className="divider" />
      <form className="accountForm" onSubmit={handleSubmit}>
        <TextField
          variant="outlined"
          fullWidth
          margin="dense"
          size="medium"
          id="password"
          name="password"
          type="password"
          label={<TextFieldLabel label="Current Password" />}
          value={form.password}
          onChange={handlePassword}
        />
        <TextField
          variant="outlined"
          fullWidth
          margin="dense"
          size="medium"
          id="newPassword"
          name="newPassword"
          type="password"
          label={<TextFieldLabel label="New Password" />}
          value={form.newPassword}
          onChange={handleNewPassword}
        />
        <FormControl
          fullWidth
          margin="normal"
        >
          <StandardButton
            type="submit"
            label="Update Password"
            disabled={submitDisabled || processing}
          />
        </FormControl>
        { alert.show && (
          <FormAlert
            theme={alert.severity}
            spacing="tight"
            content={alert.text}
          />
        )}
      </form>
    </div>
  );
};

export default UpdatePassword;