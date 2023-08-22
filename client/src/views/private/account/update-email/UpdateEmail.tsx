import { ChangeEvent, FormEvent, useEffect, useState } from 'react';

import { getAuth } from 'firebase/auth';

import { FormAlertState } from '../../../../types/forms';

import TextFieldLabel from '../../../../components/elements/TextFieldLabel';
import StandardButton from '../../../../components/buttons/StandardButton';
import FormAlert from '../../../../components/elements/FormAlert';

import { FormControl, TextField } from '@mui/material';

import { testEmail } from '../../../../helpers/validation';
import { updateUserEmail } from '../../../../services/account';

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

  const auth = getAuth();

  // Test for form validity
  useEffect(() => {
    const emailTrimmed = form.email.trim();
    const passwordTrimmed = form.password.trim();

    if (testEmail(emailTrimmed) && passwordTrimmed) {
      setSubmitDisabled(false);
    } else {
      setSubmitDisabled(true);
    }
  }, [form, auth]);

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

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();

    const emailTrimmed = form.email.trim();
    const passwordTrimmed = form.password.trim();

    // Test to see if the entered email is the user's current email
    const fbUser = auth.currentUser;
    const currentEmail = fbUser?.email;

    if (currentEmail === emailTrimmed) {
      setAlert({
        show: true,
        text: 'The new email must be different than your current email.',
        severity: 'error'
      });
      return;
    }

    // Build callbacks
    const success = () => {
      setProcessing(false);
      setForm((prevState) => ({
        ...prevState,
        email: '',
        password: ''
      }));
      setAlert({
        show: true,
        text: 'Email updated sucessfully.',
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
    updateUserEmail({
      email: emailTrimmed,
      password: passwordTrimmed,
      success,
      failure,
    });
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
          id="updateEmailPassword"
          name="updateEmailPassword"
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