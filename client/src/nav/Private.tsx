import React from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';

// Import views
import Dashboard from '../views/private/dashboard/Dashboard';
import Profile from '../views/private/profile/Profile';

const Private = () => {
  return (
    <Routes>
      <Route path="/" element={<Dashboard />} />
      <Route path="/profile" element={<Profile />} />
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
};

export default Private;
