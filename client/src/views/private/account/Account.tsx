import React from 'react';

import PageLayout from '../../../layouts/PageLayout';
import DeleteAccount from './delete-account/DeleteAccount';

import UpdateEmail from './update-email/UpdateEmail';
import UpdatePassword from './update-password/UpdatePassword';

const Account = () => {
  return (
    <PageLayout>
      <div className="viewContainer">
        <div className="gutters">
          <h1>
            Need to make changes to your <span className="highlight">account</span>?
          </h1>
          <UpdateEmail />
          <UpdatePassword />
          <DeleteAccount />
        </div>
      </div>
    </PageLayout>
  );
};

export default Account;