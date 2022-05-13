import React from 'react';

import { useMsal } from '@azure/msal-react';
import { loginRequest } from '../../../authConfig';
import { IPublicClientApplication } from '@azure/msal-browser';

import PageLayout from '../../../layouts/PageLayout';

const SignIn = () => {
  const { instance } = useMsal();

  const signIn = (instance: IPublicClientApplication) => {
    instance.loginRedirect(loginRequest).catch((e) => console.error(e));
  };

  return (
    <PageLayout>
      <div className="viewContainer">
        Yo!
      </div>
    </PageLayout>
  );
};

export default SignIn;