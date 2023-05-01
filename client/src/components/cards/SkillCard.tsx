import { ChangeEvent } from 'react';
import { Radio, RadioGroup } from '@mui/material';
import { ProfileSkill, SkillLevel, UserSkill } from '../../types/profile';

type SkillCardProps = {
  skill?: ProfileSkill;
  handler?: (skillData: UserSkill) => void,
};

const SkillCard = (props: SkillCardProps) => {
  const { skill, handler } = props;

  const skillCode = skill?.code ?? '';
  const skillLabel = skill?.description ?? 'Skill Level';
  const skillLevel = skill?.level ?? 0;

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
      <span className="skillCardLabel" id={labelId}>
        {skillLabel}
      </span>
      <div className="skillCard">
        <RadioGroup
          aria-labelledby={labelId}
          name={skillCode}
          row
          value={skillLevel}
          onChange={handleSelection}
        >
          <Radio value={0}/>
          <Radio value={1}/>
          <Radio value={2}/>
          <Radio value={3}/>
          <Radio value={4}/>
        </RadioGroup>
      </div>
    </div>
  );
};

export default SkillCard;