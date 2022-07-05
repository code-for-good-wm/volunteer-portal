import React, { ChangeEvent, useEffect, useState } from 'react';

import { FormAlertState } from '../../../../types/forms';

import TextFieldLabel from '../../../../components/elements/TextFieldLabel';
import StandardButton from '../../../../components/buttons/StandardButton';
import FormAlert from '../../../../components/elements/FormAlert';

import { FormControl, TextField } from '@mui/material';

import { testEmail, testPassword } from '../../../../helpers/validation';

type UpdateEmailForm = {
  email: string,
  password: string,
};

const UpdateEmail = () => {
  const [submitDisabled, setSubmitDisabled] = useState(true);
  const [form, setForm] = useState<UpdateEmailForm>({
    email: '',
    password: '',
  });
  const [alert, setAlert] = useState<FormAlertState>({
    show: false,
    text: '',
  });
  const [processing, setProcessing] = useState(false);

  // Test for form validity
  useEffect(() => {
    const emailTrimmed = form.email.trim();
    const passwordTrimmed = form.password.trim();
    if (testEmail(emailTrimmed) && passwordTrimmed) {
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

  const handleEmail = (event: ChangeEvent<HTMLInputElement>) => {
    const { value } = event.target;
    setForm((prevState) => ({
      ...prevState,
      email: value,
    }));
    if (alert.show) {
      resetAlert();
    }
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

  const handleSubmit = () => {
    // Do things
  };

  return (
    <div className="contentCard accountCard">
      <h2>
        Update Email
      </h2>
      <div className="divider" />
      <form className="accountForm" onSubmit={handleSubmit}>
        <TextField
          variant="outlined"
          fullWidth
          margin="dense"
          size="medium"
          id="email"
          name="email"
          type="email"
          label={<TextFieldLabel label="New Email" />}
          value={form.email}
          onChange={handleEmail}
        />
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
        <FormControl
          fullWidth
          margin="normal"
        >
          <StandardButton
            type="submit"
            label="Update Email"
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

export default UpdateEmail;