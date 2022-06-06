import React from 'react';

import { Agreement } from '../../types/profile';

import { Checkbox, IconButton } from '@mui/material';
import { LaunchOutlined } from '@mui/icons-material';

type AgreementFormProps = {
  theme?: Agreement,
  required?: boolean,
  selected?: boolean,
  handler?: (dietaryRestriction?: Agreement) => void,
};

const AgreementForm = (props: AgreementFormProps) => {
  const { theme, required, selected, handler } = props;
  const checked = !!selected;
  const handleCheckbox = handler ? handler : () => console.log('Checkbox toggled.');

  // Build UI
  let title: string;
  let content: React.ReactNode;
  let label: string;

  const termsAndConditionsContent = (
    <div>
      <p>
        Code for Good (CFG) is committed to the safety, good health, and well-being of all CFG members and event attendees across all in-person conferences, curated events and programs.  CFG is taking the following precautionary steps to ensure safe events for all participants.  Click the link below to read more about Code for Good&apos;s Covid-19 Terms and Conditions.
      </p>
    </div>
  );

  const photoReleaseContent = (
    <div>
      <p>
        Photographic, audio or video recordings may be used for the following purposes:
      </p>
      <ul>
        <li>conference presentations</li>
        <li>educational presentations or courses</li>
        <li>informational presentations</li>
        <li>online educational courses</li>
        <li>educational videos</li>
      </ul>
      <p>
        By signing this release I understand this permission signifies that photographic or video recordings of me may be electronically displayed via the Internet or in the public educational setting.
      </p>
    </div>
  );

  const codeOfConductContent = (
    <div>
      <p>
        A primary goal for Code for Good is to be inclusive to the largest number of contributors, with the most varied and diverse backgrounds as possible.  As such, we are committed to providing a friendly, safe, and welcome environment for all, regardless of gender, sexual orientation, ability, ethnicity, socioeconomic status, and religion (or lack thereof).
      </p>
      <p>
        This code of conduct outlines our expectations for all those who participate in our community, as well as the consequences for unacceptable behavior.
      </p>
      <p>
        We invite all those who participate in Code for Good to help us create safe and positive experiences for everyone.
      </p>
    </div>
  );

  switch (theme) {
  case 'termsAndConditions':
    title = 'In-Person Event Covid-19 Terms & Conditions';
    content = termsAndConditionsContent;
    label = 'I agree with CFG\'s Covid-19 Terms & Conditions';
    break;
  case 'photoRelease':
    title = 'Photograph & Video Release Form';
    content = photoReleaseContent;
    label = 'I agree with CFG\'s Photograph & Video Release Form';
    break;
  case 'codeOfConduct':
    title = 'Code of Conduct';
    content = codeOfConductContent;
    label = 'I agree with CFG\'s Code of Conduct';
    break;
  default:
    title = '';
    content = null;
    label = '';
  }

  return (
    <form className="agreementForm" onClick={() => handleCheckbox(theme)}>
      <h3>
        {title}
      </h3>
      {content}
      <div className="checkboxContainer">
        <Checkbox checked={checked} />
        <span className="checkboxLabel">
          <span className="text">
            {label}
            {required && (
              <span className="red">*</span>
            )}
          </span>
          <IconButton>
            <LaunchOutlined />
          </IconButton>
        </span>
      </div>
    </form>
  );
};

export default AgreementForm;