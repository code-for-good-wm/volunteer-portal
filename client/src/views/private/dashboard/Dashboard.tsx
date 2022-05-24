import React from 'react';
import { useNavigate } from 'react-router-dom';
import StandardButton from '../../../components/buttons/StandardButton';

import PageLayout from '../../../layouts/PageLayout';
import { user } from '../../../store/authSlice';
import { useAppSelector } from '../../../store/hooks';

const Dashboard = () => {
  const userData = useAppSelector(user);
  // TODO: Test userData and determine if registration is complete.
  // If so, we want to allow the user to edit their registration and show different content.

  const navigate = useNavigate();

  const handleButton = () => {
    navigate('/profile');
  };

  return (
    <PageLayout>
      <div className="viewContainer">
        <div className="gutters">
          <h1>
            This is the <span className="highlight">dashboard</span>.
          </h1>
          <div className="contentCard dashboardCard">
            <p className="paragraph center">
              Are you here to register as a volunteer for Code for Good?
            </p>
            <p className="paragraph center">
              Well, you&apos;ve come to the right place.
            </p>
            <p className="paragraph center">
              Mash the button below to get started.
            </p>
          </div>
          <div className="dashboardButtonContainer">
            <StandardButton
              label="Let's do this!"
              handler={handleButton}
            />
          </div>
        </div>
      </div>
    </PageLayout>
  );
};

export default Dashboard;