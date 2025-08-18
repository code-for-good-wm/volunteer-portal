import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { refreshCurrentUserData } from '../../../../services/auth';

import StandardButton from '../../../../components/buttons/StandardButton';

type PercentCompleteProps = {
  percentComplete: number,
  completionDate?: string | null,
  updatedDate?: string | null
}

const PercentComplete = (props: PercentCompleteProps) => {
  const { percentComplete, completionDate, updatedDate } = props;

  // If the completion date is present and the last updated is empty, set it to the completion date
  // If the last updated date is older than 1 year, prompt the person to update their profile
  let lastUpdateDate;
  if (!updatedDate && completionDate) {
    lastUpdateDate = Date.parse(completionDate);
  } else if (updatedDate) {
    lastUpdateDate = Date.parse(updatedDate);
  } else {
    lastUpdateDate = Date.now();
  }
  const updateProfile = lastUpdateDate < Date.now() - (365 * 24 * 60 * 60 * 1000);

  const [processing, setProcessing] = useState(false);

  const navigate = useNavigate();
  
  const handleButton = () => {
    // Here we should refresh the profile data prior to navigation
    setProcessing(true);

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
      {updateProfile && (
          <p className='updateProfilePrompt'>It&apos;s been a while since you updated your profile. Want to take another look?</p>
      )}

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
