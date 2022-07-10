import React from 'react';
import { Outlet } from 'react-router-dom';

import PageLayout from '../../../layouts/PageLayout';

const Profile = () => {
  return (
    <PageLayout>
      <Outlet />
    </PageLayout>
  );
};

export default Profile;