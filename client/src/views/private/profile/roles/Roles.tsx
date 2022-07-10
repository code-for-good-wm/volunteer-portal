import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { useAppSelector } from '../../../../store/hooks';
import { profile } from '../../../../store/profileSlice';

import { Role } from '../../../../types/profile';

import RoleCard from '../../../../components/cards/RoleCard';
import StandardButton from '../../../../components/buttons/StandardButton';

import { roles } from '../../../../helpers/constants';
import { updateUserRoles } from '../../../../services/profile';

const Roles = () => {
  const [selectedRoles, setSelectedRoles] = useState<Role[]>([]);
  const [processing, setProcessing] = useState(false);

  const profileData = useAppSelector(profile);

  const navigate = useNavigate();

  // On mount, determine if any roles are associated with this user
  useEffect(() => {
    const userRoles = profileData?.roles ?? [];
    setSelectedRoles(userRoles);
  }, [profileData]);

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

  const handleNext = () => {
    const success = () => {
      setProcessing(false);
      navigate('/profile/getting-started');
    };

    const failure = () => {
      setProcessing(false);
    };

    setProcessing(true);

    updateUserRoles({
      roles: selectedRoles,
      success,
      failure,
    });
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

  const submitDisabled = selectedRoles.length < 1;

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
                handler={handleNext}
                disabled={submitDisabled || processing}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Roles;