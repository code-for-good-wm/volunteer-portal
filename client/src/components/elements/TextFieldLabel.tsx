import React from 'react';

type TextFieldLabelProps = {
  label: string,
  required?: boolean,
};

const TextFieldLabel = (props: TextFieldLabelProps) => {
  const { label, required } = props;
  return (
    <span className="inputLabel">
      {label}
      { required && (
        <span className="sup">
          *
        </span>
      )}
    </span>
  );
};

export default TextFieldLabel;