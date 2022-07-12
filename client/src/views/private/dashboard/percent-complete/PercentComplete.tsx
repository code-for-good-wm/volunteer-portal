import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { refreshCurrentUserData } from '../../../../services/auth';

import StandardButton from '../../../../components/buttons/StandardButton';

type PercentCompleteProps = {
  percentComplete: number,
}

const PercentComplete = (props: PercentCompleteProps) => {
  const { percentComplete } = props;

  const [processing, setProcessing] = useState(false);

  const navigate = useNavigate();

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

  const buttonLabel = percentComplete === 0 ? 'Let\'s get started!' : 'Update my info';

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