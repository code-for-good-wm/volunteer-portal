import React, { useEffect, useState, ChangeEvent } from 'react';
import { useNavigate } from 'react-router-dom';

import { useAppSelector, useAppDispatch } from '../../../../store/hooks';
import { updateAuth, user } from '../../../../store/authSlice';
import { updateProfile, profile } from '../../../../store/profileSlice';

import { User } from '../../../../types/user';
import { Agreement, Agreements, DietaryRestriction, Profile, ShirtSize } from '../../../../types/profile';

import ProfileLayout from '../../../../layouts/ProfileLayout';
import { FormControl, FormControlLabel, InputAdornment, Radio, RadioGroup, TextField } from '@mui/material';
import { BadgeOutlined, LocalPhoneOutlined, LinkedIn, Link } from '@mui/icons-material';

import StandardButton from '../../../../components/buttons/StandardButton';
import TextFieldLabel from '../../../../components/elements/TextFieldLabel';
import ShirtSizeCard from '../../../../components/elements/ShirtSizeCard';
import DietaryRestrictionCard from '../../../../components/elements/DietaryRestrictionCard';
import AgreementFormItem from '../../../../components/elements/AgreementFormItem';

import { dietaryRestrictions, shirtSizes } from '../../../../helpers/constants';
import { getGettingStartedProfileData } from '../../../../services/profile';
import { getNextProfileSectionId, parsePhone } from '../../../../helpers/functions';
import { testPhone } from '../../../../helpers/validation';

type BasicInfoForm = {
  name: string,
  phone: string,
};

type ContactInfoForm = {
  linkedInUrl: string,
  websiteUrl: string,
  portfolioUrl: string,
};

type ExtraStuff = {
  previousVolunteer: boolean,
  shirtSize: ShirtSize,
  dietaryRestrictions: DietaryRestriction[],
}

type AgreementForm = {
  termsAndConditions: boolean,
  photoRelease: boolean,
  codeOfConduct: boolean,
};

type AgreementUpdate = {
  termsAndConditions?: boolean,
  photoRelease?: boolean,
  codeOfConduct?: boolean,
};

const GettingStarted = () => {
  const [basicInfoForm, setBasicInfoForm] = useState<BasicInfoForm>({
    name: '',
    phone: '',
  });

  const [contactInfoForm, setContactInfoForm] = useState<ContactInfoForm>({
    linkedInUrl: '',
    websiteUrl: '',
    portfolioUrl: '',
  });

  const [extraStuff, setExtraStuff] = useState<ExtraStuff>({
    previousVolunteer: false,
    shirtSize: '',
    dietaryRestrictions: [],
  });

  const [accessibilityRequirements, setAccessibilityRequirements] = useState('');

  const [agreements, setAgreements] = useState<AgreementForm>({
    termsAndConditions: false,
    photoRelease: false,
    codeOfConduct: false,
  });

  const [submitDisabled, setSubmitDisabled] = useState(true);

  const [processing, setProcessing] = useState(false);

  const userData = useAppSelector(user);
  const profileData = useAppSelector(profile);

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

  // Test for form validity
  useEffect(() => {
    const testBasicInfoForm = () => {
      const nameTrimmed = basicInfoForm.name.trim();
      const phoneTrimmed = parsePhone(basicInfoForm.phone).number;

      if (nameTrimmed.length < 3 || !testPhone(phoneTrimmed)) {
        return false;
      }

      return true;
    };

    const testExtraStuff = () => {
      if (!extraStuff.shirtSize) {
        return false;
      }

      return true;
    };

    const testAgreements = () => {
      const { termsAndConditions, photoRelease, codeOfConduct } = agreements;
      if (!termsAndConditions || !photoRelease || !codeOfConduct) {
        return false;
      }

      return true;
    };

    if (testBasicInfoForm() && testExtraStuff() && testAgreements()) {
      setSubmitDisabled(false);
    } else {
      setSubmitDisabled(true);
    }
  }, [basicInfoForm, contactInfoForm, extraStuff, agreements]);

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

  const handleBack = () => {
    navigate(-1);
  };

  const handleNext = () => {
    // TODO: Replace with actual user update functionality
    if (userData && profileData) {
      setProcessing(true);

      const name = basicInfoForm.name.trim();
      const phone = parsePhone(basicInfoForm.phone).number;
      const linkedInUrl = contactInfoForm.linkedInUrl.trim();
      const websiteUrl = contactInfoForm.websiteUrl.trim();
      const portfolioUrl = contactInfoForm.websiteUrl.trim();
      const { previousVolunteer, shirtSize, dietaryRestrictions } = extraStuff;
      const { termsAndConditions, photoRelease, codeOfConduct } = agreements;

      const timestamp = new Date().toISOString();

      let agreementsUpdate: Agreements = {};

      if (profileData.agreements) {
        agreementsUpdate = {
          ...profileData.agreements
        };
      }

      if (termsAndConditions) {
        agreementsUpdate.termsAndConditions = timestamp;
      }

      if (photoRelease) {
        agreementsUpdate.photoRelease = timestamp;
      }

      if (codeOfConduct) {
        agreementsUpdate.codeOfConduct = timestamp;
      }

      const profileUpdate: Profile = {
        ...profileData,
        linkedInUrl,
        websiteUrl,
        portfolioUrl,
        previousVolunteer,
        shirtSize,
        dietaryRestrictions,
        accessibilityRequirements: accessibilityRequirements.trim(),
        agreements: agreementsUpdate,
      };

      const userUpdate: User = {
        ...userData,
        name,
        phone,
      };

      dispatch(
        updateProfile({
          data: profileUpdate,
        })
      );

      dispatch(
        updateAuth({
          user: userUpdate,
        })
      );

      setProcessing(false);
    }

    // Determine next view to display
    const nextSection = getNextProfileSectionId() ?? '';
    if (!nextSection) {
      // TODO: If something bad happens here, what do we do?
      return;
    }
    if (nextSection === true) {
      navigate('/profile/complete');
    } else {
      navigate(`/profile/${nextSection}`);
    }
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
        <div className="contentCard profileCard basicInformationProfileCard">

          {/* Basic Information */}

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
                  type="text"
                  label={<TextFieldLabel label="First and Last Name" required />}
                  value={basicInfoForm.name}
                  onChange={handleName}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <BadgeOutlined />
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
                  type="phone"
                  label={<TextFieldLabel label="Phone Number" required />}
                  value={basicInfoForm.phone}
                  onChange={handlePhone}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <LocalPhoneOutlined />
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
                  type="text"
                  label={<TextFieldLabel label="LinkedIn" />}
                  value={contactInfoForm.linkedInUrl}
                  onChange={handleLinkedInUrl}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <LinkedIn />
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
                  type="text"
                  label={<TextFieldLabel label="Website Link" />}
                  value={contactInfoForm.websiteUrl}
                  onChange={handleWebsiteUrl}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Link />
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
                  type="text"
                  label={<TextFieldLabel label="Portfolio Link" />}
                  value={contactInfoForm.portfolioUrl}
                  onChange={handlePortfolioUrl}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Link />
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
          <form className="profileForm">
            <AgreementFormItem
              theme="termsAndConditions"
              required={true}
              selected={agreements.termsAndConditions}
              handler={handleAgreement}
            />
            <AgreementFormItem
              theme="photoRelease"
              required={true}
              selected={agreements.photoRelease}
              handler={handleAgreement}
            />
            <AgreementFormItem
              theme="codeOfConduct"
              spacing="tight"
              required={true}
              selected={agreements.codeOfConduct}
              handler={handleAgreement}
            />
          </form>
        </div>

        {/* Button Controls */}

        <div className="controls">
          <div className="buttonContainer">
            <StandardButton
              label="Next"
              handler={handleNext}
              disabled={submitDisabled || processing}
            />
          </div>
          <div className="buttonContainer spacing">
            <StandardButton
              theme="secondary"
              label="Back"
              handler={handleBack}
              disabled={processing}
            />
          </div>
        </div>
      </div>
    </ProfileLayout>
  );
};

export default GettingStarted;