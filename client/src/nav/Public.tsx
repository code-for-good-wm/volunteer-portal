import { Navigate, Route, Routes } from 'react-router-dom';

// Import views
import SignIn from '../views/public/sign-in/SignIn';

const Public = () => {
  return (
    <Routes>
      <Route path="/" element={<SignIn />} />
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
};

export default Public;
