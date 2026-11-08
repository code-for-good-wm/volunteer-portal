import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import RowActionButton from './RowActionButton';

describe('RowActionButton', () => {
  it('is an outlined button by default', () => {
    render(<RowActionButton label="Open" onClick={() => undefined} />);

    const button = screen.getByRole('button', { name: 'Open' });
    expect(button).toHaveClass('MuiButton-outlined', 'MuiButton-sizeSmall');
  });

  it('is a filled button when the row needs attention', () => {
    render(
      <RowActionButton label="Review" emphasis onClick={() => undefined} />,
    );

    expect(screen.getByRole('button', { name: 'Review' })).toHaveClass(
      'MuiButton-contained',
    );
  });

  it('uses the aria-label as its accessible name', () => {
    render(
      <RowActionButton
        label="Open"
        aria-label="Open Food Bank"
        onClick={() => undefined}
      />,
    );

    expect(
      screen.getByRole('button', { name: 'Open Food Bank' }),
    ).toHaveTextContent('Open');
  });

  it('calls onClick when clicked', async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(<RowActionButton label="Open" onClick={onClick} />);

    await user.click(screen.getByRole('button', { name: 'Open' }));

    expect(onClick).toHaveBeenCalledTimes(1);
  });
});
