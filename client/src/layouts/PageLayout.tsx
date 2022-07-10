import React from 'react';

import HeaderBar from '../components/elements/HeaderBar';

type PageLayoutProps = {
  children?: React.ReactNode
};

const PageLayout = (props: PageLayoutProps) => {
  const { children } = props;

  return (
    <div className="pageLayout">
      <HeaderBar />
      {children}
    </div>
  );
};

export default PageLayout;