import React from 'react';
import { useNavigate } from 'react-router-dom';

import PageLayout from '../../../layouts/PageLayout';

import { useAppSelector } from '../../../store/hooks';
import { user } from '../../../store/authSlice';

import StandardButton from '../../../components/buttons/StandardButton';

const Dashboard = () => {
  const userData = useAppSelector(user);

  console.log('Here is the user data stored in state: ', userData);

  const profile = userData?.profile;

  const navigate = useNavigate();

  const handleButton = () => {
    navigate('/profile');
  };

  // Build UI
  const contentCard = (
    <div className="contentCard dashboardCard">
      { profile?.completionDate ? (
        <>
          <p className="center">
            Thank you for registering as a volunteer for Code for Good.
          </p>
          <p className="center">
            We&apos;re super excited to have you!
          </p>
          <p className="center">
            Mash the button below to update your profile.
          </p>
        </>
      ) : (
        <>
          <p className="center">
            Are you here to register as a volunteer for Code for Good?
          </p>
          <p className="center">
            Well, you&apos;ve come to the right place.
          </p>
          <p className="center">
            Mash the button below to get started.
          </p>
        </>
      )}
    </div>
  );

  const buttonLabel = profile?.completionDate ? 'Update my info' : 'Let\'s do this!';

  return (
    <PageLayout>
      <div className="viewContainer">
        <div className="gutters">
          <h1>
            This is the <span className="highlight">dashboard</span>.
          </h1>
          {contentCard}
          <div className="dashboardButtonContainer">
            <StandardButton
              label={buttonLabel}
              handler={handleButton}
            />
          </div>
        </div>
      </div>
    </PageLayout>
  );
};

export default Dashboard;