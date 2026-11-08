import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import SkillCard from './SkillCard';
import type { ProfileSkill } from '../../types/profile';

const reactSkill: ProfileSkill = {
  code: 'react',
  description: 'React',
  level: 2,
};

describe('SkillCard', () => {
  it('shows one option per skill level with the current level selected', () => {
    render(<SkillCard skill={reactSkill} />);

    const radios = screen.getAllByRole('radio');
    expect(radios).toHaveLength(5);
    expect(screen.getByRole('radio', { name: 'Familiar' })).toBeChecked();
    expect(screen.getByRole('radio', { name: 'None' })).not.toBeChecked();
  });

  it('labels the group with the skill name', () => {
    render(<SkillCard skill={reactSkill} />);

    expect(
      screen.getByRole('radiogroup', { name: 'React' }),
    ).toBeInTheDocument();
  });

  it('reports the selected level as a number', async () => {
    const user = userEvent.setup();
    const handler = vi.fn();
    render(<SkillCard skill={reactSkill} handler={handler} />);

    await user.click(screen.getByRole('radio', { name: 'Daily Use' }));

    expect(handler).toHaveBeenCalledWith({ code: 'react', level: 4 });
  });

  it('does not report a selection when there is no skill', async () => {
    const user = userEvent.setup();
    const handler = vi.fn();
    vi.spyOn(console, 'log').mockImplementation(() => undefined);
    render(<SkillCard handler={handler} />);

    await user.click(screen.getByRole('radio', { name: 'Newbie' }));

    expect(handler).not.toHaveBeenCalled();
  });
});
