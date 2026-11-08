import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

vi.mock('../../../services/position', () => ({
  createPosition: vi.fn(),
  updatePosition: vi.fn(),
  deletePosition: vi.fn(),
}));

import {
  createPosition,
  deletePosition,
  updatePosition,
} from '../../../services/position';
import PositionDialog from './PositionDialog';
import { Position } from '../../../types/position';

const mockCreatePosition = vi.mocked(createPosition);
const mockUpdatePosition = vi.mocked(updatePosition);
const mockDeletePosition = vi.mocked(deletePosition);

const renderDialog = (
  position?: Position,
  existingPositions: Position[] = [],
) => {
  const onClose = vi.fn();
  const onSaved = vi.fn();
  render(
    <PositionDialog
      open
      onClose={onClose}
      onSaved={onSaved}
      projectId="project-1"
      projectName="Client Intake Portal"
      nonprofitName="Hope Network"
      position={position}
      existingPositions={existingPositions}
    />,
  );
  return { onClose, onSaved, user: userEvent.setup() };
};

const chooseRole = async (
  user: ReturnType<typeof userEvent.setup>,
  name: string,
) => {
  await user.click(screen.getByRole('button', { name: /^Role/ }));
  await user.click(
    within(screen.getByRole('listbox')).getByRole('option', { name }),
  );
};

describe('PositionDialog', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('shows the title with the project and nonprofit', () => {
    renderDialog();

    const dialog = screen.getByRole('dialog', { name: 'Add a position' });
    expect(dialog).toHaveTextContent('Client Intake Portal · Hope Network');
  });

  it('starts empty, with Add position disabled', () => {
    renderDialog();

    expect(screen.getByRole('button', { name: /^Role/ })).toHaveTextContent(
      'Select Role',
    );
    expect(screen.getByRole('textbox')).toHaveValue('0');
    expect(screen.getByRole('button', { name: 'Add position' })).toBeDisabled();
  });

  it('needs at least one person as well as a role', async () => {
    const { user } = renderDialog();

    await chooseRole(user, 'Developer');

    expect(screen.getByRole('button', { name: 'Add position' })).toBeDisabled();
  });

  it('saves the role and number of people, then closes', async () => {
    const saved = {
      _id: 'pos-1',
      project: 'project-1',
      role: 'developer',
      slotCount: 2,
    };
    mockCreatePosition.mockResolvedValue(saved as never);
    const { user, onSaved, onClose } = renderDialog();

    await chooseRole(user, 'Developer');
    await user.click(screen.getByRole('button', { name: 'Increase' }));
    await user.click(screen.getByRole('button', { name: 'Increase' }));
    await user.click(screen.getByRole('button', { name: 'Add position' }));

    expect(mockCreatePosition).toHaveBeenCalledWith('project-1', {
      role: 'developer',
      slotCount: 2,
    });
    await vi.waitFor(() => expect(onSaved).toHaveBeenCalledWith(saved));
    expect(onClose).toHaveBeenCalled();
  });

  it('stays open when saving fails', async () => {
    mockCreatePosition.mockResolvedValue(null);
    const { user, onClose } = renderDialog();

    await chooseRole(user, 'Team lead');
    await user.click(screen.getByRole('button', { name: 'Increase' }));
    await user.click(screen.getByRole('button', { name: 'Add position' }));

    await vi.waitFor(() => expect(mockCreatePosition).toHaveBeenCalled());
    expect(onClose).not.toHaveBeenCalled();
    expect(screen.getByRole('button', { name: 'Add position' })).toBeEnabled();
  });

  it('closes from Cancel and the close button without saving', async () => {
    const { user, onClose } = renderDialog();

    await user.click(screen.getByRole('button', { name: 'Cancel' }));
    await user.click(screen.getByRole('button', { name: 'Close' }));

    expect(onClose).toHaveBeenCalledTimes(2);
    expect(mockCreatePosition).not.toHaveBeenCalled();
  });

  describe('editing', () => {
    const existing: Position = {
      _id: 'pos-1',
      project: 'project-1',
      role: 'designer',
      slotCount: 2,
      notes: 'form flow',
    };

    it('starts from the position being edited', () => {
      renderDialog(existing);

      expect(
        screen.getByRole('dialog', { name: 'Edit position' }),
      ).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /^Role/ })).toHaveTextContent(
        'Designer',
      );
      expect(screen.getByRole('textbox')).toHaveValue('2');
      expect(
        screen.getByRole('button', { name: 'Save changes' }),
      ).toBeEnabled();
    });

    it('saves the changes, keeping the notes', async () => {
      const saved = { ...existing, role: 'developer', slotCount: 3 };
      mockUpdatePosition.mockResolvedValue(saved as never);
      const { user, onSaved, onClose } = renderDialog(existing);

      await chooseRole(user, 'Developer');
      await user.click(screen.getByRole('button', { name: 'Increase' }));
      await user.click(screen.getByRole('button', { name: 'Save changes' }));

      expect(mockUpdatePosition).toHaveBeenCalledWith('project-1', 'pos-1', {
        role: 'developer',
        slotCount: 3,
        notes: 'form flow',
      });
      expect(mockCreatePosition).not.toHaveBeenCalled();
      await vi.waitFor(() => expect(onSaved).toHaveBeenCalledWith(saved));
      expect(onClose).toHaveBeenCalled();
    });
  });

  describe('roles the project already has', () => {
    const developer: Position = {
      _id: 'dev',
      project: 'project-1',
      role: 'developer',
      slotCount: 3,
    };
    const designer: Position = {
      _id: 'design',
      project: 'project-1',
      role: 'designer',
      slotCount: 1,
    };

    const option = (name: RegExp) =>
      within(screen.getByRole('listbox')).getByRole('option', { name });

    it("can't be picked for a new position", async () => {
      const { user } = renderDialog(undefined, [developer]);

      await user.click(screen.getByRole('button', { name: /^Role/ }));

      expect(option(/^Developer/)).toHaveAttribute('aria-disabled', 'true');
      expect(option(/^Developer/)).toHaveTextContent('already added');
      expect(option(/^Designer/)).not.toHaveAttribute('aria-disabled');
    });

    it("stay available for the position that has them when it's edited", async () => {
      const { user } = renderDialog(developer, [developer, designer]);

      await user.click(screen.getByRole('button', { name: /^Role/ }));

      expect(option(/^Developer/)).not.toHaveAttribute('aria-disabled');
      expect(option(/^Designer/)).toHaveAttribute('aria-disabled', 'true');
    });
  });

  describe('deleting', () => {
    const existing: Position = {
      _id: 'pos-1',
      project: 'project-1',
      role: 'developer',
      slotCount: 2,
    };

    const renderEdit = (lockedSlotCount = 0) => {
      const onClose = vi.fn();
      const onDeleted = vi.fn();
      render(
        <PositionDialog
          open
          onClose={onClose}
          onDeleted={onDeleted}
          projectId="project-1"
          position={existing}
          lockedSlotCount={lockedSlotCount}
        />,
      );
      return { onClose, onDeleted, user: userEvent.setup() };
    };

    it('is only offered when editing', () => {
      renderDialog();

      expect(
        screen.queryByRole('button', { name: 'Delete position' }),
      ).not.toBeInTheDocument();
    });

    it('asks for confirmation, then deletes and closes', async () => {
      mockDeletePosition.mockResolvedValue(true);
      const { user, onClose, onDeleted } = renderEdit();

      await user.click(screen.getByRole('button', { name: 'Delete position' }));
      expect(mockDeletePosition).not.toHaveBeenCalled();
      expect(
        screen.getByText('Delete the Developer position?'),
      ).toBeInTheDocument();
      await user.click(screen.getByRole('button', { name: 'Delete' }));

      expect(mockDeletePosition).toHaveBeenCalledWith('project-1', 'pos-1');
      await vi.waitFor(() => expect(onDeleted).toHaveBeenCalledWith(existing));
      expect(onClose).toHaveBeenCalled();
    });

    it('does nothing when the confirmation is cancelled', async () => {
      const { user, onClose } = renderEdit();

      await user.click(screen.getByRole('button', { name: 'Delete position' }));
      const confirm = screen
        .getByText('Delete the Developer position?')
        .closest('.dialogAlert') as HTMLElement;
      await user.click(within(confirm).getByRole('button', { name: 'Cancel' }));

      expect(mockDeletePosition).not.toHaveBeenCalled();
      expect(onClose).not.toHaveBeenCalled();
    });

    it('is disabled while people are invited or confirmed', () => {
      renderEdit(1);

      expect(
        screen.getByRole('button', { name: 'Delete position' }),
      ).toBeDisabled();
    });

    it("won't go below the slots people are in", () => {
      renderEdit(2);

      expect(screen.getByRole('button', { name: 'Decrease' })).toBeDisabled();
    });
  });
});
