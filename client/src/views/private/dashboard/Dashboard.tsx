import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { useAppSelector } from '../../../store/hooks';
import { profile } from '../../../store/profileSlice';

import { calculateProfilePercentComplete } from '../../../services/profile';

import PageLayout from '../../../layouts/PageLayout';

import PercentComplete from './percent-complete/PercentComplete';
import CFGInfo from './cfg-info/CFGInfo';

const Dashboard = () => {
  const [percentComplete, setPercentComplete] = useState(0);

  const profileData = useAppSelector(profile);

  const navigate = useNavigate();

  useEffect(() => {
    if (profileData) {
      // Get percent complete
      const pct = calculateProfilePercentComplete(profileData);
      setPercentComplete(pct);

      // Auto-direct to profile if no profile data
      if (pct === 0) {
        navigate('/profile');
      }
    }
  }, [profileData]);

  return (
    <PageLayout>
      <div className="viewContainer">
        <div className="gutters">
          <h1>
            This is the <span className="highlight">dashboard</span>.
          </h1>
          <PercentComplete percentComplete={percentComplete} />
          <CFGInfo />
        </div>
      </div>
    </PageLayout>
  );
};

export default Dashboard;