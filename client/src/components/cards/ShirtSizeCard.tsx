import Shirt from '../../assets/icons/shirt.png';
import ShirtSmall from '../../assets/icons/shirt-s.png';
import ShirtMedium from '../../assets/icons/shirt-m.png';
import ShirtLarge from '../../assets/icons/shirt-l.png';
import ShirtXL from '../../assets/icons/shirt-xl.png';
import Shirt2XL from '../../assets/icons/shirt-2xl.png';
import Shirt3XL from '../../assets/icons/shirt-3xl.png';

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
  case '2xl':
    image = Shirt2XL;
    imageAlt = 'T-shirt with the characters 2XL on the front';
    break;
  case '3xl':
    image = Shirt3XL;
    imageAlt = 'T-shirt with the characters 3XL on the front';
    break;
  default:
    image = Shirt;
    imageAlt = 'T-shirt plain with no lettering';
  }

  const cardStyle = selected ? 'shirtSizeCard selected' : 'shirtSizeCard';

  return (
    <div className={cardStyle} onClick={() => handleCard(theme)}>
      <div className="radioContainer">
        <Radio checked={checked} inputProps={{ 'aria-label': labelText }} />
      </div>
      <div className="imageContainer">
        { image && <img src={image} alt='' /> /* removing alt-text explicitly */ }
      </div>
      <span className="label">
        {labelText}
      </span>
    </div>
  );
};

export default ShirtSizeCard;