import React, { useEffect, useState, ChangeEvent } from 'react';
import { useNavigate } from 'react-router-dom';

import { useAppDispatch } from '../../../../store/hooks';
import { updateProfile } from '../../../../store/profileSlice';

import { Agreement, DietaryRestriction, ShirtSize } from '../../../../types/profile';

import ProfileLayout from '../../../../layouts/ProfileLayout';
import { FormControl, FormControlLabel, IconButton, InputAdornment, Radio, RadioGroup, TextField } from '@mui/material';
import { BadgeOutlined, LocalPhoneOutlined, LinkedIn, Link } from '@mui/icons-material';

import StandardButton from '../../../../components/buttons/StandardButton';
import TextFieldLabel from '../../../../components/elements/TextFieldLabel';
import { dietaryRestrictions, shirtSizes } from '../../../../helpers/constants';
import { getGettingStartedProfileData } from '../../../../services/profile';
import { parsePhone } from '../../../../helpers/functions';
import ShirtSizeCard from '../../../../components/elements/ShirtSizeCard';
import DietaryRestrictionCard from '../../../../components/elements/DietaryRestrictionCard';
import AgreementForm from '../../../../components/elements/AgreementForm';

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

type AgreementForms = {
  termsAndConditions: boolean,
  photoRelease: boolean,
  codeOfConduct: boolean,
  showAlert: boolean,
  alertText: string,
};

type AgreementUpdate = {
  termsAndConditions?: boolean,
  photoRelease?: boolean,
  codeOfConduct?: boolean,
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

  const [agreements, setAgreements] = useState<AgreementForms>({
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

  const handlePreviousVolunteer = (event: ChangeEvent<HTMLInputElement>) => {
    const { value } = event.target;
    const previousVolunteer = (value === 'Yes');
    setExtraStuff((prevState) => ({
      ...prevState,
      previousVolunteer,
    }));
  };

  const handleShirtSizeCard = (shirtSize?: ShirtSize) => {
    if (!shirtSize) {
      return;
    }

    setExtraStuff((prevState) => ({
      ...prevState,
      shirtSize: shirtSize,
    }));
  };

  const handleDietaryRestrictionCard = (dietaryRestriction?: DietaryRestriction) => {
    if (!dietaryRestriction) {
      return;
    }

    if (!extraStuff.dietaryRestrictions.includes(dietaryRestriction)) {
      const newRestrictions = [
        ...extraStuff.dietaryRestrictions,
        dietaryRestriction,
      ];
      setExtraStuff((prevState) => ({
        ...prevState,
        dietaryRestrictions: newRestrictions,
      }));
    } else {
      const newRestrictions = extraStuff.dietaryRestrictions.filter((restriction) => {
        return restriction !== dietaryRestriction;
      });
      setExtraStuff((prevState) => ({
        ...prevState,
        dietaryRestrictions: newRestrictions,
      }));
    }
  };

  const handleAccessibilityRequirements = (event: ChangeEvent<HTMLInputElement>) => {
    const { value } = event.target;
    setAccessibilityRequirements(value);
  };

  const handleAgreement = (agreement?: Agreement) => {
    if (!agreement) {
      return;
    }

    const agreementsUpdate: AgreementUpdate = {};
    agreementsUpdate[agreement] = !agreements[agreement];
    setAgreements((prevState) => ({
      ...prevState,
      ...agreementsUpdate,
    }));
  };

  const handleNext = () => {
    // TODO: Collect data and update user profile
    // TODO: Update user data with new roles
    // TODO: Determine next section based on user roles
    navigate('/profile/technical-skills');
  };

  // Build shirt sizes
  const shirtSizeCards = shirtSizes.map((shirtSize) => {
    const { id, description } = shirtSize;
    const selected = extraStuff.shirtSize === id;
    return (
      <ShirtSizeCard
        key={id}
        theme={id}
        selected={selected}
        label={description}
        handler={handleShirtSizeCard}
      />
    );
  });

  // Build dietary restrictions
  const dietaryRestrictionCards = dietaryRestrictions.map((restriction) => {
    const { id, description } = restriction;
    const selected = extraStuff.dietaryRestrictions.includes(id);
    return (
      <DietaryRestrictionCard
        key={id}
        theme={id}
        selected={selected}
        label={description}
        handler={handleDietaryRestrictionCard}
      />
    );
  });

  return (
    <ProfileLayout>
      <div className="profileContentContainer">
        <h1>
          Tell us a little about <span className="highlight">yourself</span>.
        </h1>

        {/* Basic Information */}

        <div className="contentCard profileCard basicInformationProfileCard">
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
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <IconButton>
                          <BadgeOutlined />
                        </IconButton>
                      </InputAdornment>
                    )
                  }}
                />
              </div>
              <div className="textFieldWrapperSmall">
                <TextField
                  variant="outlined"
                  fullWidth
                  margin="normal"
                  sx={{
                    marginBottom: 0
                  }}
                  size="medium"
                  id="phone"
                  name="phone"
                  color="primary"
                  type="phone"
                  label={<TextFieldLabel label="Phone Number" required />}
                  value={basicInfoForm.phone}
                  onChange={handlePhone}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <IconButton>
                          <LocalPhoneOutlined />
                        </IconButton>
                      </InputAdornment>
                    )
                  }}
                />
              </div>
            </form>
          </section>
          <section className="bottomPadding">
            <h2>
              Additional Contact Info
            </h2>
            <form className="profileForm">
              <div className="textFieldWrapperMedium">
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
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <IconButton>
                          <LinkedIn />
                        </IconButton>
                      </InputAdornment>
                    )
                  }}
                />
              </div>
              <div className="textFieldWrapperMedium">
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
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <IconButton>
                          <Link />
                        </IconButton>
                      </InputAdornment>
                    )
                  }}
                />
              </div>       
              <div className="textFieldWrapperMedium">
                <TextField
                  variant="outlined"
                  fullWidth
                  margin="normal"
                  sx={{
                    marginBottom: 0
                  }}
                  size="medium"
                  id="portfolioUrl"
                  name="portfolioUrl"
                  color="primary"
                  type="text"
                  label={<TextFieldLabel label="Portfolio Link" />}
                  value={contactInfoForm.portfolioUrl}
                  onChange={handlePortfolioUrl}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <IconButton>
                          <Link />
                        </IconButton>
                      </InputAdornment>
                    )
                  }}
                />
              </div>
            </form>
          </section>
          <section>
            <h2>
              The Extra Stuff
            </h2>
            <div className="profileQuestionWrapper">
              <p className="profileQuestion" id="previousVolunteer">
                <span className="question">
                  Have you volunteered with Code for Good before?<span className="red">*</span>
                </span>
              </p>
              <FormControl>
                <RadioGroup
                  aria-labelledby="previousVolunteer"
                  name="previousVolunteer"
                  row
                  value={extraStuff.previousVolunteer ? 'Yes' : 'No'}
                  onChange={handlePreviousVolunteer}
                >
                  <FormControlLabel 
                    value="No" 
                    control={<Radio />} 
                    label={<span className="radioLabel">No</span>} 
                  />
                  <FormControlLabel 
                    value="Yes" 
                    control={<Radio />} 
                    label={<span className="radioLabel">Yes</span>} 
                  />
                </RadioGroup>
              </FormControl>
            </div>
            <div className="profileQuestionWrapper">
              <p className="profileQuestion">
                <span className="question">
                  What&apos;s your shirt size?<span className="red">*</span>
                </span>
                <span className="note">
                  We use adult sizing only.
                </span>
              </p>
              <div className="shirtSizeSelections">
                {shirtSizeCards}
              </div>
            </div>
            <div>
              <p className="profileQuestion">
                <span className="question">
                  Do you have any dietary restrictions?
                </span>
                <span className="note">
                  Select as many as you need.
                </span>
              </p>
              <div className="dietaryRestrictionSelections">
                {dietaryRestrictionCards}
              </div>
            </div>
          </section>
        </div>

        {/* Accessibility */}

        <div className="contentCard profileCard">
          <h2>
            Accessibility
          </h2>
          <div className="divider" />
          <form className="profileForm">
            <p className="profileQuestion" id="accessibilityRequirements">
              <span className="question">
                Do you have any accessibility requirements you would like us to be aware of?
              </span>
            </p>
            <TextField
              margin="normal"
              sx={{
                marginBottom: 0
              }}
              fullWidth
              aria-labelledby="accessibilityRequirements"
              name="accessibilityRequirements"
              value={accessibilityRequirements}
              placeholder="Enter any personal accessibility requirements or considerations."
              multiline={true}
              rows={2}
              onChange={handleAccessibilityRequirements}
            />
          </form>
        </div>

        {/* Terms & Conditions */}

        <div className="contentCard profileCard">
          <div className="cardHeadingWithNote">
            <h2>
              Terms &amp; Conditions
            </h2>
            <span className="note">
              <span className="sup red">
                *
              </span>
              Required
            </span>
          </div>
          <div className="divider" />
          <AgreementForm
            theme="termsAndConditions"
            required={true}
            selected={agreements.termsAndConditions}
            handler={handleAgreement}
          />
          <AgreementForm
            theme="photoRelease"
            required={true}
            selected={agreements.photoRelease}
            handler={handleAgreement}
          />
          <AgreementForm
            theme="codeOfConduct"
            required={true}
            selected={agreements.codeOfConduct}
            handler={handleAgreement}
          />
        </div>

        {/* Button Controls */}

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