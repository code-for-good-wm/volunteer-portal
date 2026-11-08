import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import DialogAlert from './DialogAlert';

describe('DialogAlert', () => {
  it('renders nothing while not visible', () => {
    render(<DialogAlert visible={false} title="Delete?" />);

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('shows default text and both buttons', () => {
    render(<DialogAlert visible />);

    const dialog = screen.getByRole('dialog');
    expect(dialog).toHaveTextContent('Alert');
    expect(dialog).toHaveTextContent('This is an alert.');
    expect(screen.getByRole('button', { name: 'OK' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Cancel' })).toBeInTheDocument();
  });

  it('calls the OK and Cancel handlers', async () => {
    const user = userEvent.setup();
    const handleOk = vi.fn();
    const handleCancel = vi.fn();
    render(
      <DialogAlert
        visible
        title="Delete event?"
        message="This can't be undone."
        okLabel="Delete"
        cancelLabel="Keep"
        handleOk={handleOk}
        handleCancel={handleCancel}
      />,
    );

    await user.click(screen.getByRole('button', { name: 'Delete' }));
    await user.click(screen.getByRole('button', { name: 'Keep' }));

    expect(handleOk).toHaveBeenCalledTimes(1);
    expect(handleCancel).toHaveBeenCalledTimes(1);
  });

  it('can hide the Cancel button', () => {
    render(<DialogAlert visible hideCancel />);

    expect(
      screen.queryByRole('button', { name: 'Cancel' }),
    ).not.toBeInTheDocument();
  });

  it('calls handleClose when dismissed with Escape', async () => {
    const user = userEvent.setup();
    const handleClose = vi.fn();
    render(<DialogAlert visible handleClose={handleClose} />);

    await user.keyboard('{Escape}');

    expect(handleClose).toHaveBeenCalledTimes(1);
  });
});
