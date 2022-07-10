import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

import PageLayout from '../../../layouts/PageLayout';

import { useAppSelector } from '../../../store/hooks';
import { profile } from '../../../store/profileSlice';

import StandardButton from '../../../components/buttons/StandardButton';
import { refreshCurrentUserData } from '../../../services/auth';
import { calculateProfilePercentComplete } from '../../../services/profile';

const Dashboard = () => {
  const [processing, setProcessing] = useState(false);
  const [percentComplete, setPercentComplete] = useState(0);

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
  }, [profileData]); // run once on load

  const handleButton = () => {
    const success = () => {
      setProcessing(false);
      navigate('/profile');
    };

    const failure = () => {
      setProcessing(false);
    };

    refreshCurrentUserData({ success, failure });
  };

  // Build UI
  const contentCard = (
    <div className="contentCard dashboardCard">
      { profileData?.completionDate ? (
        <>
          <p>Thank you for registering as a volunteer for Code for Good.</p>
          <p>We&apos;re super excited to have you!</p>
          <p>Mash the button below to update your profile.</p>
        </>
      ) : (
        <>
          <p>Are you here to register as a volunteer for Code for Good?</p>
          <p>Well, you&apos;ve come to the right place.</p>
          <p>Mash the button below to get started.</p>
        </>
      )}
    </div>
  );

  const buttonLabel = profileData?.completionDate ? 'Update my info' : 'Let\'s do this!';

  return (
    <PageLayout>
      <div className="viewContainer">
        <div className="gutters">
          <h1>
            This is the <span className="highlight">dashboard</span>.
          </h1>
          <div className="contentCard dashboardCard">
            <p>Your profile is</p>
            <p className="highlight bigNumber"><b>{percentComplete}%</b></p>
            <p>complete!</p>
          </div>
          {contentCard}
          <div className="dashboardButtonContainer">
            <StandardButton
              label={buttonLabel}
              handler={handleButton}
              disabled={processing}
            />
          </div>
        </div>
      </div>
    </PageLayout>
  );
};

export default Dashboard;