import React, { useEffect, useState, ChangeEvent } from 'react';
import { useNavigate } from 'react-router-dom';

import { useAppDispatch } from '../../../../store/hooks';
import { updateProfile } from '../../../../store/profileSlice';

import { ProfileSkill, UserSkill } from '../../../../types/profile';

import ProfileLayout from '../../../../layouts/ProfileLayout';

import StandardButton from '../../../../components/buttons/StandardButton';
import SkillCard from '../../../../components/elements/SkillCard';

import { TextField } from '@mui/material';

import { convertSkillDataToObject, getAdditionalSkills, getUserSkills } from '../../../../helpers/functions';
import { updateAdditionalSkills } from '../../../../services/profile';
import { skillLevels, otherExperience } from '../../../../helpers/constants';

const AdditionalSkills = () => {
  const [otherExperienceLevels, setOtherExperienceLevels] = useState<ProfileSkill[]>([]);
  
  const [otherSkills, setOtherSkills] = useState('');

  const [processing, setProcessing] = useState(false);

  const dispatch = useAppDispatch();

  const navigate = useNavigate();

  // On mount, update the current profile section
  useEffect(() => {
    dispatch(
      updateProfile({
        currentSection: 'additional-skills',
      })
    );
  }, []);

  // On mount, pull any current profile data and populate the forms
  useEffect(() => {
    const userSkills = getUserSkills() ?? [];

    // Build object out of user skill data
    const userSkillData = convertSkillDataToObject(userSkills);

    const populatedOtherExperienceLevels = otherExperience.map((skill) => {
      const { code, description } = skill;
      const merge: ProfileSkill = {
        code,
        description,
        level: userSkillData[code] ?? 0,
      };
      return merge;
    });

    const otherSkillsContent = getAdditionalSkills() ?? '';

    setOtherExperienceLevels(populatedOtherExperienceLevels);
    setOtherSkills(otherSkillsContent);
  }, []);

  const handleOtherExperienceLevelUpdate = (skillData: UserSkill) => {
    const { code, level } = skillData;

    const update = otherExperienceLevels.map((setting) => {
      if (setting.code === code) {
        const newSetting = {
          ...setting,
          level,
        };
        return newSetting;
      }
      return setting;
    });

    setOtherExperienceLevels(update);
  };

  const handleOtherSkills = (event: ChangeEvent<HTMLInputElement>) => {
    const { value } = event.target;
    setOtherSkills(value);
  };

  const handleBack = () => {
    navigate(-1);
  };

  const handleSubmit = () => {
    // Prep data
    const skillUpdate: UserSkill[] = [];

    otherExperienceLevels.forEach((setting) => {
      const { code, level } = setting;
      skillUpdate.push({
        code,
        level
      });
    });

    // Build callbacks
    const success = () => {
      setProcessing(false);
      // Continue to completion screen
      navigate('/profile/complete');
    };

    const failure = () => {
      setProcessing(false);
    };

    setProcessing(true);

    updateAdditionalSkills({
      skills: skillUpdate,
      additionalSkills: otherSkills,
      success,
      failure
    });
  };

  // Build UI
  const otherExperienceCards = otherExperienceLevels.map((skill) => {
    return (
      <SkillCard
        key={skill.code}
        skill={skill}
        handler={handleOtherExperienceLevelUpdate}
      />
    );
  });

  const skillLevelLabels = skillLevels.map((level) => {
    return (
      <span className="label" key={level.level}>
        {level.description}
      </span>
    );
  });

  return (
    <ProfileLayout>
      <div className="profileContentContainer">
        <h1>
          <span className="highlight">Anything else</span> we should know about?
        </h1>
        <div className="contentCard profileCard basicInformationProfileCard">
          <div className="cardHeadingWithNote">
            <h2>
              Additional Skills
            </h2>
            <span className="note">
              <span className="sup red">
                *
              </span>
              Required
            </span>
          </div>
          <div className="divider" />

          {/* Other Experience */}

          <section className="skillsSectionSpacing">
            <div className="profileQuestionWrapper">
              <p className="profileQuestion">
                <span className="question">
                  What&apos;s your experience level in these areas?<span className="red">*</span>
                </span>
              </p>
              <form className="profileForm">
                <div className="skillLevelLabels">
                  <div className="spacer" />
                  <div className="labels">
                    {skillLevelLabels}
                  </div>
                </div>
                <div className="skillCards">
                  {otherExperienceCards}
                </div>
              </form>
            </div>
          </section>

          {/* Other Skills */}

          <section>
            <form className="profileForm">
              <p className="profileQuestion" id="otherSkills">
                <span className="question">
                  Are there any other special skills you have that we should know about?
                </span>
              </p>
              <TextField
                margin="normal"
                fullWidth
                aria-labelledby="otherSkills"
                name="otherSkills"
                value={otherSkills}
                placeholder="Enter any additional skill sets."
                multiline={true}
                rows={2}
                onChange={handleOtherSkills}
              />
            </form>
          </section>
        </div>

        {/* Button Controls */}

        <div className="controls">
          <div className="profileSubmitButtonWrapper">
            <div className="buttonContainer">
              <StandardButton
                label="Submit"
                handler={handleSubmit}
                disabled={processing}
              />
            </div>
            <p className="profileSubmitButtonNote">
              Smash that submit button.
            </p>
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

export default AdditionalSkills;