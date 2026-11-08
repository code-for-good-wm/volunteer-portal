import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import StandardButton from './StandardButton';

describe('StandardButton', () => {
  it('shows its label, or "Button" when none is given', () => {
    const { rerender } = render(<StandardButton label="Save" />);
    expect(screen.getByRole('button', { name: 'Save' })).toBeInTheDocument();

    rerender(<StandardButton />);
    expect(screen.getByRole('button', { name: 'Button' })).toBeInTheDocument();
  });

  it('calls its handler when clicked', async () => {
    const user = userEvent.setup();
    const handler = vi.fn();
    render(<StandardButton label="Save" handler={handler} />);

    await user.click(screen.getByRole('button', { name: 'Save' }));

    expect(handler).toHaveBeenCalledTimes(1);
  });

  it('does not call its handler while disabled', async () => {
    const user = userEvent.setup({ pointerEventsCheck: 0 });
    const handler = vi.fn();
    render(<StandardButton label="Save" handler={handler} disabled />);

    const button = screen.getByRole('button', { name: 'Save' });
    expect(button).toBeDisabled();
    await user.click(button);

    expect(handler).not.toHaveBeenCalled();
  });

  it('submits its form instead of calling the handler when type is submit', async () => {
    const user = userEvent.setup();
    const handler = vi.fn();
    const onSubmit = vi.fn((e) => e.preventDefault());
    render(
      <form onSubmit={onSubmit}>
        <StandardButton type="submit" label="Submit" handler={handler} />
      </form>,
    );

    await user.click(screen.getByRole('button', { name: 'Submit' }));

    expect(onSubmit).toHaveBeenCalledTimes(1);
    expect(handler).not.toHaveBeenCalled();
  });

  it('renders a link when given a link', () => {
    render(<StandardButton label="Docs" link="/docs" />);

    expect(screen.getByRole('link', { name: 'Docs' })).toHaveAttribute(
      'href',
      '/docs',
    );
  });

  it('uses the outlined style for secondary and red for warning', () => {
    const { rerender } = render(
      <StandardButton label="Cancel" theme="secondary" />,
    );
    expect(screen.getByRole('button')).toHaveClass('MuiButton-outlined');

    rerender(<StandardButton label="Delete" theme="warning" />);
    expect(screen.getByRole('button')).toHaveClass(
      'MuiButton-contained',
      'MuiButton-containedError',
    );
  });

  it('passes an aria-label through to the button', () => {
    render(<StandardButton label="Save" aria-label="save attendance" />);

    expect(
      screen.getByRole('button', { name: 'save attendance' }),
    ).toBeInTheDocument();
  });
});
