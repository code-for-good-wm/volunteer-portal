import React from 'react';

import DiscoBall from '../../../../assets/images/disco-ball.png';

import { Button } from '@mui/material';

const ProfileComplete = () => {
  const contentCard = (
    <div className="contentCard profileCompletionCard">
      <p className="completionThanks">
        Thanks a bunch!
      </p>
      <h2 className="completionHeading">
        Your registration is complete!
      </h2>
      <div className="completionDivider" />
      <p className="center">
        Keep your eyes peeled for a confirmation email; we&apos;ll be reviewing volunteer applications shortly.  In the meantime, keep an eye out for upcoming emails from us!
      </p>
    </div>
  );

  return (
    <div className="viewContainer">
      <div className="gutters">
        <div className="completionImageContainer">
          <img src={DiscoBall} alt="Sparkling disco ball" />
        </div>
        {contentCard}
        <div className="profileCompletionButtonContainer">
          <Button
            color="primary"
            disableElevation
            fullWidth
            variant="contained"
            href="https://codeforgoodwm.org/"
          >
            <span className="standardButtonText primary center">
              Code for Good Home Page
            </span>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ProfileComplete;