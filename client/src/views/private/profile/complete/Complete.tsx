import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

import { useAppDispatch, useAppSelector } from '../../../../store/hooks';
import { showRegistrationComplete, updateProfile } from '../../../../store/profileSlice';

import DiscoBall from '../../../../assets/images/disco-ball.png';

import StandardButton from '../../../../components/buttons/StandardButton';

const ProfileComplete = () => {
  const initialCompletion = useAppSelector(showRegistrationComplete);

  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const handleDone = () => {
    // Navigate to dashboard
    navigate('/dashboard');

    // Set showRegistrationComplete flag to false
    dispatch(updateProfile({
      showRegistrationComplete: false,
    }));
  };

  const cardHeadingText = initialCompletion ? 'Your registration is complete!' : 'Your profile has been updated!';
  const cardContent = initialCompletion ? (
    <p className="center">
      Keep your eyes peeled for a confirmation email; we&apos;ll be reviewing volunteer applications shortly.  In the meantime, <a className="link" href="https://codeforgoodwm.org/">visit our website</a> and keep an eye out for upcoming emails!
    </p>
  ) : (
    <p className="center">
      We appreciate the opportunity to work with you!  We&apos;ll be reviewing volunteer applications shortly.  In the meantime, <a className="link" href="https://codeforgoodwm.org/">visit our website</a> and keep an eye out for upcoming emails!
    </p>
  );

  const contentCard = (
    <div className="contentCard profileCompletionCard">
      <p className="completionThanks">
        Thanks a bunch!
      </p>
      <h2 className="completionHeading">
        {cardHeadingText}
      </h2>
      <div className="completionDivider" />
      {cardContent}
    </div>
  );

  return (
    <div className="viewContainer">
      <div className="gutters">
        <div className="completionImageContainer">
          <img src={DiscoBall} alt="Sparkling disco ball" />
        </div>
        {contentCard}
        <div className="profileCompletionControls">
          <div className="buttonContainer">
            <StandardButton
              label="Done"
              handler={handleDone}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileComplete;