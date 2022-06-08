import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { useAppSelector, useAppDispatch } from '../../../../store/hooks';
import { user } from '../../../../store/authSlice';
import { updateProfile } from '../../../../store/profileSlice';

import ProfileLayout from '../../../../layouts/ProfileLayout';

import StandardButton from '../../../../components/buttons/StandardButton';

import { getNextProfileSection } from '../../../../helpers/functions';

const TechnicalSkills = () => {
  const [submitDisabled, setSubmitDisabled] = useState(true);

  const [processing, setProcessing] = useState(false);

  const userData = useAppSelector(user);

  const dispatch = useAppDispatch();

  const navigate = useNavigate();

  // On mount, update the current profile section
  useEffect(() => {
    dispatch(
      updateProfile({
        currentSection: 'technical-skills',
      })
    );
  }, []);

  // On mount, pull any current profile data and populate the forms
  useEffect(() => {
    // TODO: Complete getTechnicalSkillsProfileData()
  }, []);

  const handleNext = () => {
    // TODO: Replace with actual user update functionality
    if (userData) {
      setProcessing(true);

      // TODO: Update user profile data

      setProcessing(false);
    }

    // Determine next view to display
    const nextSection = getNextProfileSection() ?? '';
    if (!nextSection) {
      // TODO: If something bad happens here, what do we do?
      return;
    }
    if (nextSection === true) {
      navigate('/profile/complete');
    } else {
      navigate(`/profile/${nextSection}`);
    }
  };

  return (
    <ProfileLayout>
      <div className="profileContentContainer">
        <h1>
          Tell us about your <span className="highlight">technical</span> skills.
        </h1>

        {/* Button Controls */}

        <div className="controls">
          <div className="buttonContainer">
            <StandardButton
              label="Next"
              handler={handleNext}
              disabled={submitDisabled || processing}
            />
          </div>
        </div>
      </div>
    </ProfileLayout>
  );
};

export default TechnicalSkills;