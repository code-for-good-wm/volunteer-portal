import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { useAppDispatch } from '../../../../store/hooks';
import { updateProfile } from '../../../../store/profileSlice';

import { ProfileSkill, UserSkill } from '../../../../types/profile';

import ProfileLayout from '../../../../layouts/ProfileLayout';

import StandardButton from '../../../../components/buttons/StandardButton';
import SkillCard from '../../../../components/elements/SkillCard';

import { convertSkillDataToObject, getUserSkills, navigateToNextProfileSection } from '../../../../helpers/functions';
import { updateUserSkills } from '../../../../services/profile';
import { skillLevels, designSkills } from '../../../../helpers/constants';

const DesignSkills = () => {
  const [experienceLevels, setExperienceLevels] = useState<ProfileSkill[]>([]);
  
  const [tools, setTools] = useState<ProfileSkill[]>([]);

  const [development, setDevelopment] = useState<ProfileSkill[]>([]);

  const [processing, setProcessing] = useState(false);

  const dispatch = useAppDispatch();

  const navigate = useNavigate();

  // On mount, update the current profile section
  useEffect(() => {
    dispatch(
      updateProfile({
        currentSection: 'design-skills',
      })
    );
  }, []);

  // On mount, pull any current profile data and populate the forms
  useEffect(() => {
    const userSkills = getUserSkills() ?? [];

    // Build object out of user skill data
    const userSkillData = convertSkillDataToObject(userSkills);

    const populatedExperienceLevels = designSkills.experienceLevel.map((skill) => {
      const { code, description } = skill;
      const merge: ProfileSkill = {
        code,
        description,
        level: userSkillData[code] ?? 0,
      };
      return merge;
    });

    const populatedTools = designSkills.tools.map((skill) => {
      const { code, description } = skill;
      const merge: ProfileSkill = {
        code,
        description,
        level: userSkillData[code] ?? 0,
      };
      return merge;
    });

    const populatedDevelopment = designSkills.development.map((skill) => {
      const { code, description } = skill;
      const merge: ProfileSkill = {
        code,
        description,
        level: userSkillData[code] ?? 0,
      };
      return merge;
    });

    setExperienceLevels(populatedExperienceLevels);
    setTools(populatedTools);
    setDevelopment(populatedDevelopment);
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

  const handleToolsUpdate = (skillData: UserSkill) => {
    const { code, level } = skillData;

    const update = tools.map((setting) => {
      if (setting.code === code) {
        const newSetting = {
          ...setting,
          level,
        };
        return newSetting;
      }
      return setting;
    });

    setTools(update);
  };

  const handleDevelopmentUpdate = (skillData: UserSkill) => {
    const { code, level } = skillData;

    const update = development.map((setting) => {
      if (setting.code === code) {
        const newSetting = {
          ...setting,
          level,
        };
        return newSetting;
      }
      return setting;
    });

    setDevelopment(update);
  };

  const handleBack = () => {
    navigate(-1);
  };

  const handleNext = () => {
    // Prep data
    const skillUpdate: UserSkill[] = [];

    experienceLevels.forEach((setting) => {
      const { code, level } = setting;
      skillUpdate.push({
        code,
        level
      });
    });

    tools.forEach((setting) => {
      const { code, level } = setting;
      skillUpdate.push({
        code,
        level
      });
    });

    development.forEach((setting) => {
      const { code, level } = setting;
      skillUpdate.push({
        code,
        level
      });
    });

    // Build callbacks
    const success = () => {
      setProcessing(false);
      navigateToNextProfileSection(navigate);
    };

    const failure = () => {
      setProcessing(false);
    };

    setProcessing(true);

    updateUserSkills({
      skills: skillUpdate,
      success,
      failure
    });
  };

  // Build UI
  const experienceLevelCards = experienceLevels.map((skill) => {
    return (
      <SkillCard
        key={skill.code}
        skill={skill}
        handler={handleExperienceLevelUpdate}
      />
    );
  });

  const toolCards = tools.map((skill) => {
    return (
      <SkillCard
        key={skill.code}
        skill={skill}
        handler={handleToolsUpdate}
      />
    );
  });

  const developmentCards = development.map((skill) => {
    return (
      <SkillCard
        key={skill.code}
        skill={skill}
        handler={handleDevelopmentUpdate}
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
          Tell us about your <span className="highlight">design</span> skills.
        </h1>
        <div className="contentCard profileCard basicInformationProfileCard">
          <div className="cardHeadingWithNote">
            <h2>
              Design Skills
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

          <section className="skillsSectionSpacing">
            <div className="profileQuestionWrapper">
              <p className="profileQuestion">
                <span className="question">
                  What&apos;s your experience level?<span className="red">*</span>
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
                  {experienceLevelCards}
                </div>
              </form>
            </div>
          </section>

          {/* Tools */}

          <section className="skillsSectionSpacing">
            <div className="profileQuestionWrapper">
              <p className="profileQuestion">
                <span className="question">
                  What experience do you have with these design tools?<span className="red">*</span>
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
                  {toolCards}
                </div>
              </form>
            </div>
          </section>

          {/* Tools */}

          <section>
            <div className="profileQuestionWrapper">
              <p className="profileQuestion">
                <span className="question">
                  What development experience do you have?<span className="red">*</span>
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
                  {developmentCards}
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
              disabled={processing}
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

export default DesignSkills;