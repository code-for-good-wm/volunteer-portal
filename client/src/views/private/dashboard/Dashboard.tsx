import React from 'react';

import PageLayout from '../../../layouts/PageLayout';

import PercentComplete from './percent-complete/PercentComplete';
import CFGInfo from './cfg-info/CFGInfo';

const Dashboard = () => {
  return (
    <PageLayout>
      <div className="viewContainer">
        <div className="gutters">
          <h1>
            This is the <span className="highlight">dashboard</span>.
          </h1>
          <PercentComplete />
          <CFGInfo />
        </div>
      </div>
    </PageLayout>
  );
};

export default Dashboard;