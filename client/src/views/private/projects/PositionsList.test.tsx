import { describe, expect, it, vi } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import PositionsList from './PositionsList';
import { Position } from '../../../types/position';
import { Slot } from '../../../types/slot';

const positions: Position[] = [
  {
    _id: 'dev',
    project: 'p1',
    role: 'developer',
    slotCount: 2,
    notes: 'React front end and Azure Functions back end',
  },
  { _id: 'design', project: 'p1', role: 'designer', slotCount: 1 },
  { _id: 'lead', project: 'p1', role: 'lead', slotCount: 1 },
];

const slots: Slot[] = [
  { _id: 's1', position: 'dev', status: 'confirmed' },
  { _id: 's2', position: 'dev', status: 'invited' },
  { _id: 's3', position: 'design', status: 'confirmed-partial' },
  { _id: 's4', position: 'lead', status: 'declined' },
];

const renderList = (onAddPosition = vi.fn(), onEditPosition = vi.fn()) =>
  render(
    <PositionsList
      positions={positions}
      slots={slots}
      onAddPosition={onAddPosition}
      onEditPosition={onEditPosition}
    />,
  );

describe('PositionsList', () => {
  it('shows a card per position with its role', () => {
    renderList();

    expect(
      screen
        .getAllByRole('article')
        .map((card) => card.getAttribute('aria-label')),
    ).toEqual(['Developer', 'Designer', 'Team lead']);
  });

  it('shows how many people are needed, with the notes when there are any', () => {
    renderList();

    expect(
      screen.getByRole('article', { name: 'Developer' }),
    ).toHaveTextContent(
      '2 people needed · React front end and Azure Functions back end',
    );
    expect(screen.getByRole('article', { name: 'Designer' })).toHaveTextContent(
      /1 person needed(?! ·)/,
    );
  });

  it('counts only confirmed slots as filled', () => {
    renderList();

    const filled = (name: string) =>
      within(screen.getByRole('article', { name })).getByText(/filled$/);
    expect(filled('Developer')).toHaveTextContent('1 of 2 filled');
    expect(filled('Designer')).toHaveTextContent('1 of 1 filled');
    expect(filled('Team lead')).toHaveTextContent('0 of 1 filled');
  });

  it('opens the add dialog from the Add position button', async () => {
    const user = userEvent.setup();
    const onAddPosition = vi.fn();
    renderList(onAddPosition);

    await user.click(screen.getByRole('button', { name: '+ Add position' }));

    expect(onAddPosition).toHaveBeenCalledTimes(1);
  });

  it('opens a position for editing from its Edit button', async () => {
    const user = userEvent.setup();
    const onEditPosition = vi.fn();
    renderList(vi.fn(), onEditPosition);

    await user.click(screen.getByRole('button', { name: 'Edit Designer' }));

    expect(onEditPosition).toHaveBeenCalledWith(positions[1]);
  });
});
