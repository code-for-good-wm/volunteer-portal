import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';

import TextFieldLabel from './TextFieldLabel';
import FormAlert from './FormAlert';
import StatusChip from './StatusChip';

describe('TextFieldLabel', () => {
  it('shows the label without an asterisk by default', () => {
    const { container } = render(<TextFieldLabel label="Email" />);

    expect(container).toHaveTextContent(/^Email$/);
  });

  it('adds an asterisk when the field is required', () => {
    const { container } = render(<TextFieldLabel label="Email" required />);

    expect(container).toHaveTextContent(/^Email\*$/);
  });
});

describe('FormAlert', () => {
  it('shows its content as an info alert by default', () => {
    render(<FormAlert content="Saved!" />);

    const alert = screen.getByRole('alert');
    expect(alert).toHaveTextContent('Saved!');
    expect(alert).toHaveClass('MuiAlert-standardInfo');
  });

  it('uses the given severity', () => {
    render(<FormAlert theme="error" content="Something went wrong" />);

    expect(screen.getByRole('alert')).toHaveClass('MuiAlert-standardError');
  });
});

describe('StatusChip', () => {
  it('shows its label', () => {
    render(<StatusChip label="Accepted" theme="success" />);

    expect(screen.getByText('Accepted')).toBeInTheDocument();
  });
});
