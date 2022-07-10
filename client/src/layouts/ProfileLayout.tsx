import React from 'react';

import ProfileProgress from '../components/elements/ProfileProgress';

type PageLayoutProps = {
  children?: React.ReactNode
};

const ProfileLayout = (props: PageLayoutProps) => {
  const { children } = props;

  return (
    <div className="profileLayout">
      <ProfileProgress />
      {children}
    </div>
  );
};

export default ProfileLayout;