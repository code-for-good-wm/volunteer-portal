import Shirt from '../../assets/icons/shirt.png';
import ShirtSmall from '../../assets/icons/shirt-s.png';
import ShirtMedium from '../../assets/icons/shirt-m.png';
import ShirtLarge from '../../assets/icons/shirt-l.png';
import ShirtXL from '../../assets/icons/shirt-xl.png';
import Shirt2XL from '../../assets/icons/shirt-2xl.png';

import { ShirtSize } from '../../types/profile';

import { Radio } from '@mui/material';

type ShirtSizeCardProps = {
  theme?: ShirtSize,
  selected?: boolean,
  label?: string,
  handler?: (shirtSize?: ShirtSize) => void,
};

const ShirtSizeCard = (props: ShirtSizeCardProps) => {
  const { theme, selected, label, handler } = props;
  const checked = !!selected;
  const labelText = label ?? 'Shirt';
  const handleCard = handler ? handler : () => console.log('Card selected.');

  // Choose image
  let image: string | undefined;
  let imageAlt: string;
  switch (theme) {
  case 'small':
    image = ShirtSmall;
    imageAlt = 'T-shirt with the letter S on the front';
    break;
  case 'medium':
    image = ShirtMedium;
    imageAlt = 'T-shirt with the letter M on the front';
    break;
  case 'large':
    image = ShirtLarge;
    imageAlt = 'T-shirt with the letter L on the front';
    break;
  case 'xl':
    image = ShirtXL;
    imageAlt = 'T-shirt with the letters XL on the front';
    break;
  case 'xxl':
    image = Shirt2XL;
    imageAlt = 'T-shirt with the characters 2XL on the front';
    break;
  default:
    image = Shirt;
    imageAlt = 'T-shirt plain with no lettering';
  }

  const cardStyle = selected ? 'shirtSizeCard selected' : 'shirtSizeCard';

  return (
    <div className={cardStyle} onClick={() => handleCard(theme)}>
      <div className="radioContainer">
        { checked && <Radio checked={checked} /> }
      </div>
      <div className="imageContainer">
        { image && <img src={image} alt={imageAlt} /> }
      </div>
      <span className="label">
        {labelText}
      </span>
    </div>
  );
};

export default ShirtSizeCard;