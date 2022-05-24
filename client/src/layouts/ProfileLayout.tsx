import React from 'react';

type PageLayoutProps = {
  children?: React.ReactNode
};

const ProfileLayout = (props: PageLayoutProps) => {
  const { children } = props;

  return (
    <div className="profileLayout">
      {/* TODO: Add progress bar for desktop */}
      {children}
    </div>
  );
};

export default ProfileLayout;