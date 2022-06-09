import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { useAppSelector, useAppDispatch } from '../../../../store/hooks';
import { user } from '../../../../store/authSlice';
import { updateProfile } from '../../../../store/profileSlice';

import { ProfileSkill, SkillCode, SkillLevel, UserSkill, UserSkillData } from '../../../../types/profile';

import ProfileLayout from '../../../../layouts/ProfileLayout';

import StandardButton from '../../../../components/buttons/StandardButton';

import { getNextProfileSection } from '../../../../helpers/functions';
import { getUserSkills } from '../../../../services/profile';
import { technicalSkills } from '../../../../helpers/constants';
import SkillCard from '../../../../components/elements/SkillCard';

const TechnicalSkills = () => {
  const [experienceLevels, setExperienceLevels] = useState<ProfileSkill[]>([]);
  
  const [toolsAndLanguages, setToolsAndLanguages] = useState<ProfileSkill[]>([]);

  const [submitDisabled, setSubmitDisabled] = useState(true);

  const [processing, setProcessing] = useState(false);

  const userData = useAppSelector(user);

  const dispatch = useAppDispatch();

  const navigate = useNavigate();

  // On mount, update the current profile section
  useEffect(() => {
    dispatch(
      updateProfile({
        currentSection: 'technical-skills',
      })
    );
  }, []);

  // On mount, pull any current profile data and populate the forms
  useEffect(() => {
    const userSkills = getUserSkills() ?? [];

    // Build object out of user skill data
    const userSkillData: UserSkillData = {};
    userSkills.forEach((skill) => {
      userSkillData[skill.code] = skill.level;
    });

    const populatedExperienceLevels = technicalSkills.experienceLevel.map((skill) => {
      const { code, description } = skill;
      const merge: ProfileSkill = {
        code,
        description,
        level: userSkillData[code] ?? 0,
      };
      return merge;
    });

    const populatedToolsAndLanguages = technicalSkills.toolsAndLanguages.map((skill) => {
      const { code, description } = skill;
      const merge: ProfileSkill = {
        code,
        description,
        level: userSkillData[code] ?? 0,
      };
      return merge;
    });

    setExperienceLevels(populatedExperienceLevels);
    setToolsAndLanguages(populatedToolsAndLanguages);
  }, []);

  const handleExperienceLevelUpdate = (skillData: UserSkill) => {
    const { code, level } = skillData;

    const update = experienceLevels.map((setting) => {
      if (setting.code === code) {
        const newSetting = {
          ...setting,
          level,
        };
        return newSetting;
      }
      return setting;
    });

    setExperienceLevels(update);
  };

  const handleToolsAndLanguagesUpdate = (skillData: UserSkill) => {
    const { code, level } = skillData;

    const update = toolsAndLanguages.map((setting) => {
      if (setting.code === code) {
        const newSetting = {
          ...setting,
          level,
        };
        return newSetting;
      }
      return setting;
    });

    setToolsAndLanguages(update);
  };

  const handleBack = () => {
    navigate(-1);
  };

  const handleNext = () => {
    // TODO: Replace with actual user update functionality
    if (userData) {
      setProcessing(true);

      // TODO: Update user profile data

      setProcessing(false);
    }

    // Determine next view to display
    const nextSection = getNextProfileSection() ?? '';
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

  // Build skills
  const experienceLevelCards = experienceLevels.map((skill) => {
    return (
      <SkillCard
        key={skill.code}
        skill={skill}
        handler={handleExperienceLevelUpdate}
      />
    );
  });

  const toolsAndLanguageCards = toolsAndLanguages.map((skill) => {
    return (
      <SkillCard
        key={skill.code}
        skill={skill}
        handler={handleToolsAndLanguagesUpdate}
      />
    );
  });

  return (
    <ProfileLayout>
      <div className="profileContentContainer">
        <h1>
          Tell us about your <span className="highlight">technical</span> skills.
        </h1>
        <div className="contentCard profileCard basicInformationProfileCard">
          <div className="cardHeadingWithNote">
            <h2>
              Technical Skills
            </h2>
            <span className="note">
              <span className="sup red">
                *
              </span>
              Required
            </span>
          </div>
          <div className="divider" />

          {/* Experience Level */}

          <section>
            <div className="profileQuestionWrapper">
              <p className="profileQuestion" id="previousVolunteer">
                <span className="question">
                  What&apos;s your experience level?<span className="red">*</span>
                </span>
              </p>
              <form className="profileForm">
                <div className="skillCards">
                  {experienceLevelCards}
                </div>
              </form>
            </div>
          </section>

          {/* Tools and Languages */}

          <section>
            <div className="profileQuestionWrapper">
              <p className="profileQuestion" id="previousVolunteer">
                <span className="question">
                  What development experience do you have?<span className="red">*</span>
                </span>
              </p>
              <form className="profileForm">
                <div className="skillCards">
                  {toolsAndLanguageCards}
                </div>
              </form>
            </div>
          </section>
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

export default TechnicalSkills;