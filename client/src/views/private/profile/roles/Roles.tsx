import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { useAppSelector, useAppDispatch } from '../../../../store/hooks';
import { updateAuth, user } from '../../../../store/authSlice';

import { Role } from '../../../../types/profile';

import RoleCard from '../../../../components/elements/RoleCard';
import StandardButton from '../../../../components/buttons/StandardButton';

import { roles } from '../../../../helpers/constants';

const Roles = () => {
  const [selectedRoles, setSelectedRoles] = useState<Role[]>([]);

  const userData = useAppSelector(user);
  const profile = userData?.profile;

  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  // On mount, determine if any roles are associated with this user
  useEffect(() => {
    console.log('Profile update: ', profile);
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
    // TODO: Replace with actual user update functionality
    let userUpdate;
    if (userData) {
      console.log('Updating user data...');
      const profileUpdate = {
        ...userData.profile,
        roles: selectedRoles,
      };
      userUpdate = {
        ...userData,
        ...profileUpdate,
      };
    }

    if (userUpdate) {
      console.log('Here is the update: ', userUpdate);
      dispatch(
        updateAuth({
          user: userUpdate,
        })
      );
    }

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
    <div className="viewContainer">
      <div className="gutters">
        <h1 className="profile">
          Tell us a little about your <span className="highlight">skillsets</span>.
        </h1>
        <div className="roleSelectContainer">
          <div className="contentCard">
            <div className="roleSelectHeading">
              <h2>
                For my career or hobby, I am a...
              </h2>
              <p className="subHeading">
                {'(Wonderful & Delightful)'}
              </p>
            </div>
            <div className="roleSelections">
              {roleCards}
            </div>
          </div>
          <div className="controls">
            <div className="buttonContainer">
              <StandardButton
                label="Next"
                handler={handleButton}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Roles;