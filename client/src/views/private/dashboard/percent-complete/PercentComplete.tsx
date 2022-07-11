import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

import { useAppSelector } from '../../../../store/hooks';
import { profile } from '../../../../store/profileSlice';

import { refreshCurrentUserData } from '../../../../services/auth';
import { calculateProfilePercentComplete } from '../../../../services/profile';

import StandardButton from '../../../../components/buttons/StandardButton';

const PercentComplete = () => {
  const [percentComplete, setPercentComplete] = useState(0);
  const [processing, setProcessing] = useState(false);

  const profileData = useAppSelector(profile);

  const navigate = useNavigate();

  useEffect(() => {
    if (profileData) {
      // get percent complete
      const pct = calculateProfilePercentComplete(profileData);
      setPercentComplete(pct);

      if (pct === 0) {
        navigate('/profile');
      }
    }
  }, [profileData]);

  const handleButton = () => {
    // Here we should refresh the profile data prior to navigation
    const success = () => {
      setProcessing(false);
      navigate('/profile');
    };

    const failure = () => {
      setProcessing(false);
    };

    refreshCurrentUserData({ success, failure });
  };

  const buttonLabel = profileData?.completionDate ? 'Update my info' : 'Let\'s get started!';

  return (
    <div className="contentCard dashboardCard">
      <p>Your profile is</p>
      <p className="percentComplete">
        {percentComplete}%
      </p>
      <p>complete!</p>
      <div className="dashboardCardButtonContainer">
        <StandardButton
          label={buttonLabel}
          handler={handleButton}
          disabled={processing}
        />
      </div>
    </div>
  );
};

export default PercentComplete;