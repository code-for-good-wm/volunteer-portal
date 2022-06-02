import React from 'react';

import Designer from '../../assets/images/coffee-mug.png';
import Developer from '../../assets/images/coffee-chemex.png';
import Support from '../../assets/images/coffee-cup.png';
import Lead from '../../assets/images/coffee-pot.png';

import { Role } from '../../types/profile';

import { Checkbox } from '@mui/material';

type RoleCardProps = {
  theme?: 'designer' | 'developer' | 'support' | 'lead'
  selected?: boolean,
  label?: string,
  handler?: (role?: Role) => void,
};

const RoleCard = (props: RoleCardProps) => {
  const { theme, selected, label, handler } = props;
  const checked = !!selected;
  const labelText = label ?? '';
  const handleCard = handler ? handler : () => console.log('Card selected.');

  // Choose image
  let image: string | undefined;
  let imageAlt: string;
  switch (theme) {
  case 'designer':
    image = Designer;
    imageAlt = 'Steaming coffee mug on saucer';
    break;
  case 'developer':
    image = Developer;
    imageAlt = 'Chemex-style coffee maker with filter half-filled';
    break;
  case 'support':
    image = Support;
    imageAlt = 'Paper coffee mug with plastic lid';
    break;
  case 'lead':
    image = Lead;
    imageAlt = 'Glass coffee pot half-filled';
    break;
  default:
    image = undefined;
    imageAlt = '';
  }

  const cardStyle = selected ? 'roleCard selected' : 'roleCard';

  return (
    <div className={cardStyle} onClick={() => handleCard(theme)}>
      <div className="checkboxContainer">
        { checked && <Checkbox checked={checked} /> }
      </div>
      <div className="imageContainer">
        { image && <img src={image} alt={imageAlt} className={theme} /> }
      </div>
      <span className="label">
        {labelText}
      </span>
    </div>
  );
};

export default RoleCard;