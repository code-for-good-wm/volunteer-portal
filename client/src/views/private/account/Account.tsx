import React from 'react';

import PageLayout from '../../../layouts/PageLayout';

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

          {/* Update Email */}

          <UpdateEmail />

          {/* Update Password */}

          <UpdatePassword />

          {/* Delete Account */}

          <div className="contentCard accountCard">
            <h2>
              Delete Account
            </h2>
          </div>
        </div>
      </div>
    </PageLayout>
  );
};

export default Account;