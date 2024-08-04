import { ChangeEvent } from 'react';
import { Radio, RadioGroup } from '@mui/material';
import { ProfileSkill, SkillLevel, UserSkill } from '../../types/profile';
import { skillLevels } from '../../helpers/constants';

type SkillCardProps = {
  skill?: ProfileSkill;
  handler?: (skillData: UserSkill) => void,
};

const SkillCard = (props: SkillCardProps) => {
  const { skill, handler } = props;

  const skillCode = skill?.code ?? '';
  const skillLabel = skill?.description ?? 'Skill Level';
  const skillLevel = skill?.level ?? 0;

  const levelNames = skillLevels.map(s => s.description);

  const handleCard = handler ? handler : () => console.log('Skill level selected.');

  const handleSelection = (event: ChangeEvent<HTMLInputElement>) => {
    const selectedValue = event.target.value;
    const selectedLevel = parseInt(selectedValue);

    if (!skill?.code) {
      console.log('Invalid skill code.');
      return;
    }

    const skillData: UserSkill = {
      code: skill.code,
      level: selectedLevel as SkillLevel,
    };

    handleCard(skillData);
  };

  const labelId = `${skillCode}label`;

  return (
    <div className="skillCardContainer">
      <span className="visually-hidden">Experience level: </span>
      <span className="skillCardLabel" id={labelId}>
        {skillLabel}
      </span>
      <div className="skillCard">
        <RadioGroup
          name={skillCode}
          row
          value={skillLevel}
          onChange={handleSelection}
        >
          <Radio value={0} inputProps={{ 'aria-label': levelNames[0] }} />
          <Radio value={1} inputProps={{ 'aria-label': levelNames[1] }} />
          <Radio value={2} inputProps={{ 'aria-label': levelNames[2] }} />
          <Radio value={3} inputProps={{ 'aria-label': levelNames[3] }} />
          <Radio value={4} inputProps={{ 'aria-label': levelNames[4] }} />
        </RadioGroup>
      </div>
    </div>
  );
};

export default SkillCard;