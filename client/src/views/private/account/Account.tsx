import React, { useState } from 'react';

import PageLayout from '../../../layouts/PageLayout';

import { useAppSelector } from '../../../store/hooks';
import { profile } from '../../../store/profileSlice';

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

          <div className="contentCard accountCard">

          </div>

          {/* Update Password */}

          <div className="contentCard accountCard">

          </div>

          {/* Delete Account */}

          <div className="contentCard accountCard">

          </div>
        </div>
      </div>
    </PageLayout>
  );
};

export default Account;