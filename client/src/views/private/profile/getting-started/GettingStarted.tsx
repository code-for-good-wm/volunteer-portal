import React, { useEffect, useState, ChangeEvent } from 'react';
import { useNavigate } from 'react-router-dom';

import { useAppDispatch } from '../../../../store/hooks';
import { updateProfile } from '../../../../store/profileSlice';

import { DietaryRestriction, ShirtSize } from '../../../../types/profile';

import ProfileLayout from '../../../../layouts/ProfileLayout';
import { TextField } from '@mui/material';

import StandardButton from '../../../../components/buttons/StandardButton';
import { getGettingStartedProfileData } from '../../../../services/profile';
import TextFieldLabel from '../../../../components/elements/TextFieldLabel';
import { parsePhone } from '../../../../helpers/functions';

type BasicInfoForm = {
  name: string,
  phone: string,
  showAlert: boolean,
  alertText: string,
};

type ContactInfoForm = {
  linkedInUrl: string,
  websiteUrl: string,
  portfolioUrl: string,
  showAlert: boolean,
  alertText: string,
};

type ExtraStuff = {
  previousVolunteer: boolean,
  shirtSize: ShirtSize,
  dietaryRestrictions: DietaryRestriction[],
  showAlert: boolean,
  alertText: string,
}

type TermsAndConditions = {
  termsAndConditions: boolean,
  photoRelease: boolean,
  codeOfConduct: boolean,
  showAlert: boolean,
  alertText: string,
};

const Roles = () => {
  const [basicInfoForm, setBasicInfoForm] = useState<BasicInfoForm>({
    name: '',
    phone: '',
    showAlert: false,
    alertText: '',
  });

  const [contactInfoForm, setContactInfoForm] = useState<ContactInfoForm>({
    linkedInUrl: '',
    websiteUrl: '',
    portfolioUrl: '',
    showAlert: false,
    alertText: '',
  });

  const [extraStuff, setExtraStuff] = useState<ExtraStuff>({
    previousVolunteer: false,
    shirtSize: '',
    dietaryRestrictions: [],
    showAlert: false,
    alertText: '',
  });

  const [accessibilityRequirements, setAccessibilityRequirements] = useState('');

  const [agreements, setAgreements] = useState<TermsAndConditions>({
    termsAndConditions: false,
    photoRelease: false,
    codeOfConduct: false,
    showAlert: false,
    alertText: '',
  });

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
      setBasicInfoForm((prevState) => ({
        ...prevState,
        ...basicInfo,
      }));
      setContactInfoForm((prevState) => ({
        ...prevState,
        ...contactInfo,
      }));
      setExtraStuff((prevState) => ({
        ...prevState,
        ...data.extraStuff,
      }));
      setAccessibilityRequirements(data.accessibilityRequirements);
      setAgreements((prevState) => ({
        ...prevState,
        ...data.agreements,
      }));
    }
  }, []);

  // Handlers
  const handleName = (event: ChangeEvent<HTMLInputElement>) => {
    const { value } = event.target;
    setBasicInfoForm((prevState) => ({
      ...prevState,
      name: value,
      showAlert: false,
      alertText: '',
    }));
  };

  const handlePhone = (event: ChangeEvent<HTMLInputElement>) => {
    const { value } = event.target;
    const phone = parsePhone(value).formatted;
    setBasicInfoForm((prevState) => ({
      ...prevState,
      phone,
      showAlert: false,
      alertText: '',
    }));
  };

  const handleLinkedInUrl = (event: ChangeEvent<HTMLInputElement>) => {
    const { value } = event.target;
    setContactInfoForm((prevState) => ({
      ...prevState,
      linkedInUrl: value,
      showAlert: false,
      alertText: '',
    }));
  };

  const handleWebsiteUrl = (event: ChangeEvent<HTMLInputElement>) => {
    const { value } = event.target;
    setContactInfoForm((prevState) => ({
      ...prevState,
      websiteUrl: value,
    }));
  };

  const handlePortfolioUrl = (event: ChangeEvent<HTMLInputElement>) => {
    const { value } = event.target;
    setContactInfoForm((prevState) => ({
      ...prevState,
      portfolioUrl: value,
    }));
  };

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
          <div className="cardHeadingWithNote">
            <h2>
              Basic Information
            </h2>
            <span className="note">
              <span className="sup red">
                *
              </span>
              Required
            </span>
          </div>
          <div className="divider" />
          <section className="bottomPadding">
            <form className="profileForm">
              <div className="textFieldWrapperMedium">
                <TextField
                  variant="outlined"
                  fullWidth
                  margin="dense"
                  size="medium"
                  id="name"
                  name="name"
                  color="primary"
                  type="text"
                  label={<TextFieldLabel label="First and Last Name" required />}
                  value={basicInfoForm.name}
                  onChange={handleName}
                />
              </div>
              <div className="textFieldWrapperSmall">
                <TextField
                  variant="outlined"
                  fullWidth
                  margin="normal"
                  size="medium"
                  id="phone"
                  name="phone"
                  color="primary"
                  type="phone"
                  label={<TextFieldLabel label="Phone" required />}
                  value={basicInfoForm.phone}
                  onChange={handlePhone}
                />
              </div>
            </form>
          </section>
          <section className="bottomPadding">
            <h2>
              Additional Contact Info
            </h2>
            <form className="profileForm">
              <TextField
                variant="outlined"
                fullWidth
                margin="dense"
                size="medium"
                id="linkedInUrl"
                name="linkedInUrl"
                color="primary"
                type="text"
                label={<TextFieldLabel label="LinkedIn" required />}
                value={contactInfoForm.linkedInUrl}
                onChange={handleLinkedInUrl}
              />
              <TextField
                variant="outlined"
                fullWidth
                margin="normal"
                size="medium"
                id="websiteUrl"
                name="websiteUrl"
                color="primary"
                type="text"
                label={<TextFieldLabel label="Website Link" />}
                value={contactInfoForm.websiteUrl}
                onChange={handleWebsiteUrl}
              />
              <TextField
                variant="outlined"
                fullWidth
                margin="normal"
                size="medium"
                id="portfolioUrl"
                name="portfolioUrl"
                color="primary"
                type="text"
                label={<TextFieldLabel label="Portfolio Link" />}
                value={contactInfoForm.portfolioUrl}
                onChange={handlePortfolioUrl}
              />
            </form>
          </section>
          <section>
            <h2>
              The Extra Stuff
            </h2>

          </section>
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