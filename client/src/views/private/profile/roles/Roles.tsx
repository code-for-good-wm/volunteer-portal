import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { useAppSelector } from '../../../../store/hooks';
import { user } from '../../../../store/authSlice';

import { Role } from '../../../../types/profile';

import ProfileLayout from '../../../../layouts/ProfileLayout';

import { roles } from '../../../../helpers/constants';
import RoleCard from '../../../../components/elements/RoleCard';
import StandardButton from '../../../../components/buttons/StandardButton';

const Roles = () => {
  const [selectedRoles, setSelectedRoles] = useState<Role[]>([]);

  const userData = useAppSelector(user);
  const profile = userData?.profile;

  const navigate = useNavigate();

  // On mount, determine if any roles are associated with this user
  useEffect(() => {
    const userRoles = profile?.roles ?? [];
    setSelectedRoles(userRoles);
  }, [profile]);

  // Build handlers
  const handleCard = (role?: Role) => {
    if (role) {
      let newRoles;
      if (!selectedRoles.includes(role)) {
        newRoles = [
          ...selectedRoles,
          role
        ];
      } else {
        newRoles = selectedRoles.filter((existingRole) => {
          return existingRole !== role;
        });
      }
      setSelectedRoles(newRoles);
    }
  };

  const handleButton = () => {
    // TODO: Update user data with new roles
    navigate('/profile/getting-started');
  };

  // Build cards
  const roleCards = roles.map((role) => {
    const selected = selectedRoles.includes(role.id);
    return (
      <RoleCard
        key={role.id}
        theme={role.id}
        selected={selected}
        label={role.description}
        handler={handleCard}
      />
    );
  });

  return (
    <ProfileLayout>
      <div className="profileContentContainer">
        <h1>
          Tell us a little about <span className="highlight">yourself</span>.
        </h1>
        <div className="contentCard profileCard">
          <div className="roleCardHeading">
            <h2>
              For my career or hobby, I am a...
            </h2>
            <p className="subHeading">
              {'(Wonderful & Delightful)'}
            </p>
          </div>
          <div className="roleCardSelections">
            {roleCards}
          </div>
        </div>
        <div className="profileSubmitButtonContainer">
          <StandardButton
            label="Next"
            handler={handleButton}
          />
        </div>
      </div>
    </ProfileLayout>
  );
};

export default Roles;