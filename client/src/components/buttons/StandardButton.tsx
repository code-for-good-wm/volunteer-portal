import { Button } from '@mui/material';

type StandardButtonProps = {
  type?: 'submit' | 'button',
  theme?: 'primary' | 'secondary' | 'warning',
  disabled?: boolean,
  label?: string,
  handler?: () => void,
  link?: string,
};

const StandardButton = (props: StandardButtonProps) => {
  const { type, theme, disabled, label, handler, link } = props;

  const buttonType = type || 'button';
  const buttonTheme = theme || 'primary';
  const handleButton = handler ? handler : () => console.log('Button clicked!');
  const buttonLabel = label || 'Button';
  const variantType = theme === 'secondary' ? 'outlined' : 'contained';

  const buttonTextStyle = `standardButtonText ${disabled && theme === 'secondary' ? 'disabled' : buttonTheme}`;
  const buttonColor = theme === 'warning' ? 'error' : 'primary';

  return (
    <Button
      type={buttonType}
      color={buttonColor}
      disableElevation
      fullWidth
      variant={variantType}
      disabled={disabled}
      onClick={(buttonType === 'submit' || link) ? undefined : handleButton}
      href={link}
    >
      <span className={buttonTextStyle}>
        {buttonLabel}
      </span>
    </Button>
  );
};

export default StandardButton;