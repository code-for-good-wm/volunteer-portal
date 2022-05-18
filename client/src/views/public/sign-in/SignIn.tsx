import React, { useState, ChangeEvent, FormEvent } from 'react';

import PageLayout from '../../../layouts/PageLayout';
import StandardButton from '../../../components/buttons/StandardButton';
import TextButton from '../../../components/buttons/TextButton';

import { Checkbox, FormControl, FormControlLabel, TextField } from '@mui/material';

type SignInForm = {
  email: string,
  password: string,
}

const SignIn = () => {
  const [newUser, setNewUser] = useState(false);
  const [form, setForm] = useState<SignInForm>({
    email: '',
    password: '',
  });

  // Handlers
  const handleEmail = (event: ChangeEvent<HTMLInputElement>) => {
    const { value } = event.target;
    setForm((prevState) => ({
      ...prevState,
      email: value
    }));
  };

  const handlePassword = (event: ChangeEvent<HTMLInputElement>) => {
    const { value } = event.target;
    setForm((prevState) => ({
      ...prevState,
      password: value
    }));
  };

  const handleNewUser = () => {
    setNewUser(prevState => !prevState);
  };

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    // TODO: Attempt sign in OR create new user
  };

  const newUserCheckbox = (
    <Checkbox
      checked={newUser}
      color="primary"
      id="newUser"
      onChange={handleNewUser}
    />
  );

  const buildInputLabel = (label: string) => {
    return (
      <span className="inputLabel">
        {label}
      </span>
    );
  };

  const newUserCheckboxLabel = (
    <span className="checkboxLabel">
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
          <form className="signInForm" onSubmit={handleSubmit}>
            <TextField
              variant="outlined"
              fullWidth
              margin="dense"
              size="medium"
              id="email"
              name="email"
              color="primary"
              type="email"
              label={buildInputLabel('Email')}
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
              color="primary"
              type="password"
              label={buildInputLabel('Password')}
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
              />
            </FormControl>
            <FormControl
              fullWidth
              margin="dense"
            >
              <StandardButton
                type="submit"
                theme="primary"
                label={buttonLabel}
              />
            </FormControl>
            <FormControl
              fullWidth
              margin="dense"
            >
              <TextButton
                type="button"
                label="Forgot Your Password?"
              />
            </FormControl>
          </form>
        </div>
      </div>
    </PageLayout>
  );
};

export default SignIn;