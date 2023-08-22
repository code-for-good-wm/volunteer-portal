type TextButtonProps = {
  type?: 'submit' | 'button',
  disabled?: boolean,
  label?: string,
  handler?: () => void,
};

const TextButton = (props: TextButtonProps) => {
  const { type, disabled, label, handler } = props;

  const buttonType = type || 'button';
  const handleButton = handler ? handler : () => console.log('Button clicked!');
  const buttonLabel = label || 'Button';

  return (
    <button
      className="textButton"
      type={buttonType}
      onClick={buttonType === 'submit' || disabled ? undefined : handleButton}
    >
      {buttonLabel}
    </button>
  );
};

export default TextButton;