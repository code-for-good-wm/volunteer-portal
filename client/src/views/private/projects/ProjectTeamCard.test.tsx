import { describe, expect, it, vi } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import ProjectTeamCard from './ProjectTeamCard';
import { Position } from '../../../types/position';
import { Slot } from '../../../types/slot';

const positions: Position[] = [
  { _id: 'dev', project: 'p1', role: 'developer', slotCount: 4 },
  { _id: 'lead', project: 'p1', role: 'lead', slotCount: 2 },
];

const slots: Slot[] = [
  { _id: 's1', position: 'dev', status: 'confirmed' },
  { _id: 's2', position: 'dev', status: 'invited' },
  { _id: 's3', position: 'lead', status: 'confirmed-partial' },
  { _id: 's4', position: 'lead', status: 'confirmed' },
];

describe('ProjectTeamCard', () => {
  it('shows how full each role is', () => {
    render(
      <ProjectTeamCard
        positions={positions}
        slots={slots}
        onManagePositions={vi.fn()}
      />,
    );

    const developer = screen.getByRole('listitem', { name: 'Developer' });
    expect(developer).toHaveTextContent('1 of 4 filled');
    expect(within(developer).getByRole('progressbar')).toHaveAttribute(
      'aria-valuenow',
      '25',
    );
    expect(
      screen.getByRole('listitem', { name: 'Team lead' }),
    ).toHaveTextContent('2 of 2 filled');
  });

  it('says when there are no positions yet', () => {
    render(
      <ProjectTeamCard positions={[]} slots={[]} onManagePositions={vi.fn()} />,
    );

    expect(
      screen.getByText('No positions have been added yet.'),
    ).toBeInTheDocument();
    expect(screen.queryByRole('list')).not.toBeInTheDocument();
  });

  it('calls onManagePositions from the Manage positions button', async () => {
    const user = userEvent.setup();
    const onManagePositions = vi.fn();
    render(
      <ProjectTeamCard
        positions={positions}
        slots={slots}
        onManagePositions={onManagePositions}
      />,
    );

    await user.click(
      screen.getByRole('button', { name: 'Manage positions →' }),
    );

    expect(onManagePositions).toHaveBeenCalledTimes(1);
  });
});
