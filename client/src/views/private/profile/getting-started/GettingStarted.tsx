import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { useAppSelector, useAppDispatch } from '../../../../store/hooks';
import { user } from '../../../../store/authSlice';
import { updateProfile } from '../../../../store/profileSlice';

import { DietaryRestriction, ShirtSize } from '../../../../types/profile';

import ProfileLayout from '../../../../layouts/ProfileLayout';

import StandardButton from '../../../../components/buttons/StandardButton';
import { getGettingStartedProfileData } from '../../../../services/profile';

type BasicInfoForm = {
  name: string,
  email: string,
  phone: string,
};

type ContactInfoForm = {
  linkedInUrl: string,
  websiteUrl: string,
  portfolioUrl: string,
};

const Roles = () => {
  const [basicInfoForm, setBasicInfoForm] = useState<BasicInfoForm>({
    name: '',
    email: '',
    phone: '',
  });

  const [contactInfoForm, setContactInfoForm] = useState<ContactInfoForm>({
    linkedInUrl: '',
    websiteUrl: '',
    portfolioUrl: '',
  });

  const [previousVolunteer, setPreviousVolunteer] = useState(false);
  const [shirtSize, setShirtSize] = useState<ShirtSize>('');
  const [dietaryRestrictions, setDietaryRestrictions] = useState<DietaryRestriction[]>([]);
  const [accessibilityRequirements, setAccessibilityRequirements] = useState('');
  const [termsAndConditions, setTermsAndConditions] = useState(false);
  const [photoRelease, setPhotoRelease] = useState(false);
  const [codeOfConduct, setCodeOfConduct] = useState(false);

  const dispatch = useAppDispatch();

  const navigate = useNavigate();

  // On mount, update the current profile section
  useEffect(() => {
    dispatch(
      updateProfile({
        currentSection: 'getting-started',
      })
    );
  }, []);

  // On mount, pull any current profile data and populate the forms
  useEffect(() => {
    const data = getGettingStartedProfileData();
    if (data) {
      const { basicInfo, contactInfo } = data;
      setBasicInfoForm(basicInfo);
      setContactInfoForm(contactInfo);
      setPreviousVolunteer(data.previousVolunteer);
      setShirtSize(data.shirtSize);
      setDietaryRestrictions(data.dietaryRestrictions);
      setAccessibilityRequirements(data.accessibilityRequirements);
      setTermsAndConditions(data.termsAndConditions);
      setPhotoRelease(data.photoRelease);
      setCodeOfConduct(data.codeOfConduct);
    }
  }, []);

  const handleNext = () => {
    // TODO: Collect data and update user profile
    // TODO: Update user data with new roles
    // TODO: Determine next section based on user roles
    navigate('/profile/technical-skills');
  };

  return (
    <ProfileLayout>
      <div className="profileContentContainer">
        <h1>
          Tell us a little about <span className="highlight">yourself</span>.
        </h1>
        <div className="contentCard profileCard">
          <h2>
            Basic Information
          </h2>
          <div className="divider" />
        </div>
        <div className="controls">
          <div className="buttonContainer">
            <StandardButton
              label="Next"
              handler={handleNext}
            />
          </div>
        </div>
      </div>
    </ProfileLayout>
  );
};

export default Roles;