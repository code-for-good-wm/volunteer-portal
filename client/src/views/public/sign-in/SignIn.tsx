import React, { useState, FormEvent } from 'react';

import { useMsal } from '@azure/msal-react';
import { loginRequest } from '../../../authConfig';

import PageLayout from '../../../layouts/PageLayout';
import StandardButton from '../../../components/buttons/StandardButton';

import { Button } from '@mui/material';

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

  const { instance } = useMsal();

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    instance.loginRedirect(loginRequest).catch((e) => console.error(e));
  };

  return (
    <PageLayout>
      <div className="viewContainer">
        <div className="gutters">
          <h1>
            Welcome!
          </h1>
          <form className="signInForm" onSubmit={handleSubmit}>

            <div className="buttonContainer">
              <StandardButton
                type="submit"
                theme="primary"
                label="Sign In"
              />
            </div>
          </form>
        </div>
      </div>
    </PageLayout>
  );
};

export default SignIn;