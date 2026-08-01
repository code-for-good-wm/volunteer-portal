import { Navigate, Route, Routes } from 'react-router-dom';

// Import views
import Dashboard from '../views/private/dashboard/Dashboard';
import Account from '../views/private/account/Account';
import EditEvent from '../views/private/events/EditEvent';
import EventDetail from '../views/private/events/EventDetail';
import Events from '../views/private/events/Events';
import NewEvent from '../views/private/events/NewEvent';
import AdditionalSkills from '../views/private/profile/additional-skills/AdditionalSkills';
import ProfileComplete from '../views/private/profile/complete/Complete';
import DesignSkills from '../views/private/profile/design-skills/DesignSkills';
import GettingStarted from '../views/private/profile/getting-started/GettingStarted';
import Profile from '../views/private/profile/Profile';
import Roles from '../views/private/profile/roles/Roles';
import TechnicalSkills from '../views/private/profile/technical-skills/TechnicalSkills';
import Users from '../views/private/users/Users';

const Private = () => {
  return (
    <Routes>
      <Route path="/" element={<Dashboard />} />
      <Route path="/account" element={<Account />} />
      <Route path="/profile" element={<Profile />}>
        <Route index element={<Roles />} />
        <Route path="getting-started" element={<GettingStarted />} />
        <Route path="technical-skills" element={<TechnicalSkills />} />
        <Route path="design-skills" element={<DesignSkills />} />
        <Route path="additional-skills" element={<AdditionalSkills />} />
        <Route path="complete" element={<ProfileComplete />} />
        <Route path="*" element={<Navigate to="/profile" />} />
      </Route>
      <Route path="/users" element={<Users />} />
      <Route path="/events" element={<Events />} />
      <Route path="/events/new" element={<NewEvent />} />
      <Route path="/events/:eventId/edit" element={<EditEvent />} />
      <Route path="/events/:eventId" element={<EventDetail />} />
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
};

export default Private;
