import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

import { useAppSelector, useAppDispatch } from '../../../../store/hooks';
import { user } from '../../../../store/authSlice';
import { updateProfile } from '../../../../store/profileSlice';

import ProfileLayout from '../../../../layouts/ProfileLayout';

import StandardButton from '../../../../components/buttons/StandardButton';

const Roles = () => {
  const userData = useAppSelector(user);
  const profile = userData?.profile;

  const dispatch = useAppDispatch();

  const navigate = useNavigate();

  // On mount, update the current profile section
  useEffect(() => {
    dispatch(
      updateProfile({
        currentSection: 'getting-started',
      })
    );
  }, []);

  const handleNext = () => {
    // TODO: Collect data and update user profile
    // TODO: Update user data with new roles
    // TODO: Determine next section based on user roles
    navigate('/profile/technical-skills');
  };

  return (
    <ProfileLayout>
      <div className="profileContentContainer">
        <h1>
          Tell us a little about <span className="highlight">yourself</span>.
        </h1>
        <div className="contentCard profileCard">
          <h2>
            Basic Information
          </h2>
          <div className="divider" />
        </div>
        <div className="controls">
          <div className="buttonContainer">
            <StandardButton
              label="Next"
              handler={handleNext}
            />
          </div>
        </div>
      </div>
    </ProfileLayout>
  );
};

export default Roles;