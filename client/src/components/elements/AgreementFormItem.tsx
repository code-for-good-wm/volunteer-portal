import React from 'react';

import { Agreement } from '../../types/profile';

import { Checkbox, FormControlLabel, IconButton } from '@mui/material';
import { LaunchOutlined } from '@mui/icons-material';

type AgreementFormItemProps = {
  theme?: Agreement,
  spacing?: 'normal' | 'tight',
  required?: boolean,
  selected?: boolean,
  url?: string,
  handler?: (agreement?: Agreement) => void,
};

const AgreementFormItem = (props: AgreementFormItemProps) => {
  const { theme, spacing, required, selected, url, handler } = props;
  const noMargin = (spacing === 'tight');
  const checked = !!selected;
  const handleCheckbox = handler ? handler : () => console.log('Checkbox selected.');

  // Build UI
  let title: string;
  let content: React.ReactNode;
  let label: string;

  const termsAndConditionsContent = (
    <div>
      {/* <p>
        Code for Good (CFG) is committed to the safety, good health, and well-being of all CFG members and event attendees across all in-person conferences, curated events and programs.  CFG is taking the following precautionary steps to ensure safe events for all participants.  Click the link below to read more about Code for Good&apos;s Covid-19 Terms and Conditions.
      </p> */}
      <p>
        Code for Good (CFG) is a volunteer-run collective of technology professionals dedicated to creating technical solutions for nonprofit agencies.  In order to ensure that the beneficiaries of our work will have the necessary rights to use the software we create, it is important for us to establish a clear understanding of our respective rights and our beneficiaries&apos; rights in the software that you contribute.
      </p>
      <p>
        To participate as a volunteer at CFG events, you must read and agree with our terms and conditions.  Click the link below to read our full Participant Agreement document.
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
        By checking the box below I understand this permission signifies that photographic or video recordings of me may be electronically displayed via the Internet or in the public educational setting.
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
        We invite all those who participate in Code for Good to help us create safe and positive experiences for everyone.  Click the link below to read our full Code of Conduct document.
      </p>
    </div>
  );

  switch (theme) {
  case 'termsAndConditions':
    title = 'Participant Agreement';
    content = termsAndConditionsContent;
    label = 'I agree with CFG\'s Terms & Conditions';
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

  const labelId = theme ? `${theme}Label` : 'label';

  const itemStyle = noMargin ? 'agreementFormItem noMargin' : 'agreementFormItem';

  const iconButton = url ? (
    <IconButton href={url} target="_blank">
      <LaunchOutlined color="primary" />
    </IconButton>
  ) : null;

  return (
    <div className={itemStyle}>
      <h3>
        {title}
      </h3>
      {content}
      <div className="checkboxContainer">
        <FormControlLabel
          label={(
            <span className="checkboxLabel">
              <span className="text" id={labelId}>
                {label}
                {required && (
                  <span>*</span>
                )}
              </span>
              {iconButton}
            </span>
          )}
          control={(
            <Checkbox 
              checked={checked}
              id={theme}
              inputProps={{
                'aria-labelledby': labelId,
              }}
            />
          )}
          onChange={() => handleCheckbox(theme)}
        />
      </div>
    </div>
  );
};

export default AgreementFormItem;