import React, { useState, ChangeEvent, FormEvent, useEffect } from 'react';

import PageLayout from '../../../layouts/PageLayout';
import StandardButton from '../../../components/buttons/StandardButton';
import TextButton from '../../../components/buttons/TextButton';
import TextFieldLabel from '../../../components/elements/TextFieldLabel';

import { Checkbox, FormControl, FormControlLabel, TextField } from '@mui/material';

import { signInUser, createNewUser, recoverPassword } from '../../../services/auth';
import { testEmail, testPassword } from '../../../helpers/validation';
import FormAlert from '../../../components/elements/FormAlert';

type SignInForm = {
  email: string,
  password: string,
}

type FormAlert = {
  show: boolean,
  text: string,
  severity?: 'error' | 'warning' | 'info' | 'success'
}

const SignIn = () => {
  const [newUser, setNewUser] = useState(false);
  const [submitDisabled, setSubmitDisabled] = useState(true);
  const [form, setForm] = useState<SignInForm>({
    email: '',
    password: '',
  });
  const [alert, setAlert] = useState<FormAlert>({
    show: false,
    text: '',
  });
  const [processing, setProcessing] = useState(false);

  // Test for form validity
  useEffect(() => {
    const emailTrimmed = form.email.trim();
    const passwordTrimmed = form.password.trim();
    setSubmitDisabled(!(testEmail(emailTrimmed) && passwordTrimmed));
  }, [form]);

  const resetAlert = () => {
    setAlert({
      show: false,
      text: '',
    });
  };

  // Handlers
  const handleEmail = (event: ChangeEvent<HTMLInputElement>) => {
    const { value } = event.target;
    setForm((prevState) => ({
      ...prevState,
      email: value
    }));
    if (alert.show) {
      resetAlert();
    }
  };

  const handlePassword = (event: ChangeEvent<HTMLInputElement>) => {
    const { value } = event.target;
    setForm((prevState) => ({
      ...prevState,
      password: value
    }));
    if (alert.show) {
      resetAlert();
    }
  };

  const handleNewUser = () => {
    setNewUser(prevState => !prevState);
    if (alert.show) {
      resetAlert();
    }
  };

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    const emailTrimmed = form.email.trim();
    const passwordTrimmed = form.password.trim();

    const submissionSuccess = () => {
      setProcessing(false);
    };

    const submissionFailure = (message: string) => {
      setProcessing(false);
      setAlert({
        show: true,
        text: message,
        severity: 'error'
      });
    };

    if (newUser) {
      // Test password
      if (!testPassword(passwordTrimmed)) {
        setAlert({
          show: true,
          text: 'Please enter a password six characters or greater.',
          severity: 'error'
        });
        return;
      }
      // Attempt new user creation
      setProcessing(true);
      createNewUser({
        email: emailTrimmed,
        password: passwordTrimmed,
        success: submissionSuccess,
        failure: submissionFailure,
      });
    } else {
      // Attempt sign in
      setProcessing(true);
      signInUser({
        email: emailTrimmed,
        password: passwordTrimmed,
        success: submissionSuccess,
        failure: submissionFailure,
      });
    }
  };

  const handleForgotPassword = () => {
    const emailTrimmed = form.email.trim();
    if (!testEmail(emailTrimmed)) {
      setAlert({
        show: true,
        text: 'Please enter a valid email.',
        severity: 'error'
      });
      return;
    }

    // Build callbacks
    const success = () => {
      setProcessing(false);
      setAlert({
        show: true,
        text: 'A password recovery email was sent successfully.',
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

    // Attempt sign in
    setProcessing(true);
    recoverPassword({
      email: emailTrimmed,
      success,
      failure,
    });
  };

  const newUserCheckbox = (
    <Checkbox
      checked={newUser}
      color="primary"
      id="newUser"
      inputProps={{
        'aria-labelledby': 'newUserLabel',
      }}
    />
  );

  const newUserCheckboxLabel = (
    <span className="checkboxLabel" id="newUserLabel">
      I am a new user
    </span>
  );

  const buttonLabel = newUser ? 'Create Account' : 'Sign In';

  return (
    <PageLayout>
      <div className="viewContainer">
        <div className="gutters">
          <h1>
            Welcome!
          </h1>
          <div className="contentCard signInCard">
            <form className="form" onSubmit={handleSubmit}>
              <TextField
                variant="outlined"
                fullWidth
                margin="dense"
                size="medium"
                id="email"
                name="email"
                type="email"
                label={<TextFieldLabel label="Email" />}
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
                label={<TextFieldLabel label="Password" />}
                value={form.password}
                onChange={handlePassword}
              />
              <FormControl
                fullWidth
                margin="dense"
              >
                <FormControlLabel
                  control={newUserCheckbox}
                  label={newUserCheckboxLabel}
                  onChange={handleNewUser}
                />
              </FormControl>
              <FormControl
                fullWidth
                margin="dense"
              >
                <StandardButton
                  type="submit"
                  label={buttonLabel}
                  disabled={submitDisabled || processing}
                />
              </FormControl>
              <FormControl
                fullWidth
                margin="dense"
              >
                <TextButton
                  type="button"
                  label="Forgot Your Password?"
                  handler={handleForgotPassword}
                  disabled={processing}
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
        </div>
      </div>
    </PageLayout>
  );
};

export default SignIn;