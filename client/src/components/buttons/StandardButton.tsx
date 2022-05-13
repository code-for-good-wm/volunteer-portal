import React from 'react';

import { capitalizeFirstLetter } from '../../helpers/functions';

type StandardButtonProps = {
  type?: 'submit' | 'button',
  theme?: 'primary'
  disabled?: boolean,
  label?: string,
  handler?: () => void,
};

const StandardButton = (props: StandardButtonProps) => {
  const { type, theme, disabled, label, handler } = props;

  const buttonType = type || 'button';
  const buttonTheme = theme || 'primary';
  const handleButton = handler ? handler : () => console.log('Button clicked!');
  const buttonLabel = label || 'Button';

  // Build button
  const buttonClass = `standardButton${capitalizeFirstLetter(buttonTheme)}`;

  return (
    <button type={disabled ? 'button' : buttonType} onClick={buttonType === 'submit' || disabled ? undefined : handleButton} className={buttonClass}>
      {buttonLabel}
    </button>
  );
};

export default StandardButton;