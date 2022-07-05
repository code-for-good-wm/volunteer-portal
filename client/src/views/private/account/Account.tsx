import { TextField } from '@mui/material';
import React, { useState } from 'react';

import PageLayout from '../../../layouts/PageLayout';

import { useAppSelector } from '../../../store/hooks';
import { profile } from '../../../store/profileSlice';
import UpdateEmail from './update-email/UpdateEmail';

const Account = () => {
  const [processing, setProcessing] = useState(false);

  const profileData = useAppSelector(profile);

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

          <div className="contentCard accountCard">
            <h2>
              Update Password
            </h2>
          </div>

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