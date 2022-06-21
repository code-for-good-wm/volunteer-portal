import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const ScrollToTop = () => {
  const location = useLocation();

  // Scroll to top upon navigation to new location
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location]);

  return <></>;
};

export default ScrollToTop;