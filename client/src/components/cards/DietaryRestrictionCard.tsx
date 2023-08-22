import Vegan from '../../assets/icons/vegan.png';
import Vegetarian from '../../assets/icons/vegetarian.png';
import NoLactose from '../../assets/icons/no-lactose.png';
import NoGluten from '../../assets/icons/no-gluten.png';
import Kosher from '../../assets/icons/kosher.png';
import NoNuts from '../../assets/icons/no-nuts.png';
import NoFish from '../../assets/icons/no-fish.png';
import NoEggs from '../../assets/icons/no-eggs.png';
import Other from '../../assets/icons/other.png';

import { DietaryRestriction } from '../../types/profile';

import { Checkbox } from '@mui/material';

type DietaryRestrictionCardProps = {
  theme?: DietaryRestriction,
  selected?: boolean,
  label?: string,
  handler?: (dietaryRestriction?: DietaryRestriction) => void,
};

const DietaryRestrictionCard = (props: DietaryRestrictionCardProps) => {
  const { theme, selected, label, handler } = props;
  const checked = !!selected;
  const labelText = label ?? 'None';
  const handleCard = handler ? handler : () => console.log('Card selected.');

  // Choose image
  let image: string | undefined;
  let imageAlt: string;
  switch (theme) {
  case 'vegan':
    image = Vegan;
    imageAlt = 'Heart outline with a V inside';
    break;
  case 'vegetarian':
    image = Vegetarian;
    imageAlt = 'Stylized letter V with a small leaf';
    break;
  case 'dairy':
    image = NoLactose;
    imageAlt = 'Outline of a carton with a diagonal line crossed through it';
    break;
  case 'gluten':
    image = NoGluten;
    imageAlt = 'Outline of a wheat flower with a diagonal line crossed through it';
    break;
  case 'kosher':
    image = Kosher;
    imageAlt = 'Outline of the rear of a hooved animal with a diagonal line crossed through it';
    break;
  case 'nuts':
    image = NoNuts;
    imageAlt = 'Outline of an acorn with a diagonal line crossed through it';
    break;
  case 'fish':
    image = NoFish;
    imageAlt = 'Outline of a small fish with a diagonal line crossed through it';
    break;
  case 'eggs':
    image = NoEggs;
    imageAlt = 'Outline of an egg with a diagonal line crossed through it';
    break;
  case 'other':
    image = Other;
    imageAlt = 'A question mark';
    break;
  default:
    image = undefined;
    imageAlt = '';
  }

  const cardStyle = selected ? 'dietaryRestrictionCard selected' : 'dietaryRestrictionCard';

  const checkboxContainerStyle = selected ? 'checkboxContainer checked' : 'checkboxContainer';

  return (
    <div className={cardStyle} onClick={() => handleCard(theme)}>
      <div className={checkboxContainerStyle}>
        <Checkbox checked={checked} />
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

export default DietaryRestrictionCard;