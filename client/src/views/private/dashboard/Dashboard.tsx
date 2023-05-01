import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { useAppSelector } from '../../../store/hooks';
import { profile } from '../../../store/profileSlice';
import { loadUpcomingEventsAndAttendance } from '../../../services/event';
import { calculateProfilePercentComplete } from '../../../services/profile';
import PageLayout from '../../../layouts/PageLayout';

import PercentComplete from './percent-complete/PercentComplete';
import UpcomingEvents from './upcoming-events/UpcomingEvents';
import CFGInfo from './cfg-info/CFGInfo';

const Dashboard = () => {
  const [percentComplete, setPercentComplete] = useState(0);

  const profileData = useAppSelector(profile);

  const navigate = useNavigate();

  // load data on first visit
  useEffect(() => {
    loadUpcomingEventsAndAttendance();
  }, []);

  useEffect(() => {
    if (profileData) {
      // Get percent complete
      const pct = calculateProfilePercentComplete(profileData);
      setPercentComplete(pct);

      // Auto-direct to profile if no profile data
      if (pct === 0) {
        navigate('/profile');
        return;
      }
    }
  }, [profileData]);

  return (
    <PageLayout>
      <div className="viewContainer">
        <div className="gutters">
          <h1>
            <span className="highlight">upcoming events</span>
          </h1>
          <UpcomingEvents />
          <h1>
            <span className="highlight">profile</span>
          </h1>
          <PercentComplete percentComplete={percentComplete} />
          <CFGInfo />
        </div>
      </div>
    </PageLayout>
  );
};

export default Dashboard;