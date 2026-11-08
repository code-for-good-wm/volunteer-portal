import Button from '@mui/material/Button';
import LinearProgress from '@mui/material/LinearProgress';

import { roleLabels } from '../../../helpers/roles';
import { colors } from '../../../material/colors';
import { Position } from '../../../types/position';
import { Slot } from '../../../types/slot';

type ProjectTeamCardProps = {
  positions: Position[];
  /** Slots for these positions (others are ignored). */
  slots: Slot[];
  onManagePositions: () => void;
};

/** Overview card showing how full each role's position is. */
const ProjectTeamCard = ({
  positions,
  slots,
  onManagePositions,
}: ProjectTeamCardProps) => {
  const filledByPosition = new Map<string, number>();
  for (const slot of slots) {
    if (slot.status === 'confirmed' || slot.status === 'confirmed-partial') {
      filledByPosition.set(
        slot.position,
        (filledByPosition.get(slot.position) ?? 0) + 1,
      );
    }
  }

  return (
    <section
      aria-labelledby="project-team-heading"
      style={{
        backgroundColor: colors.surface.card,
        borderRadius: 5,
        padding: '28px 32px',
        boxShadow:
          '0px 1px 10px 0px rgba(0,0,0,0.06), 0px 3px 5px 0px rgba(0,0,0,0.1)',
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: 16,
        }}
      >
        <h2
          id="project-team-heading"
          style={{ color: colors.text.primary, margin: 0 }}
        >
          Project team
        </h2>
        <Button
          onClick={onManagePositions}
          sx={{
            color: colors.teal.deep,
            textTransform: 'none',
            fontSize: 'inherit',
            p: 0,
            minWidth: 0,
            '&:hover': {
              backgroundColor: 'transparent',
              textDecoration: 'underline',
            },
          }}
        >
          Manage positions →
        </Button>
      </div>

      {positions.length === 0 ? (
        <p style={{ color: colors.text.secondary }}>
          No positions have been added yet.
        </p>
      ) : (
        <ul style={{ listStyle: 'none', margin: '16px 0 0', padding: 0 }}>
          {positions.map((position) => {
            const role = roleLabels[position.role] ?? position.role;
            const filled = filledByPosition.get(position._id) ?? 0;
            const percent =
              position.slotCount > 0
                ? Math.min(100, (filled / position.slotCount) * 100)
                : 0;

            return (
              <li
                key={position._id}
                aria-label={role}
                style={{ marginBottom: 16 }}
              >
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    gap: 16,
                    marginBottom: 6,
                  }}
                >
                  <span style={{ color: colors.text.primary }}>{role}</span>
                  <span style={{ color: colors.text.secondary }}>
                    {filled} of {position.slotCount} filled
                  </span>
                </div>
                <LinearProgress
                  variant="determinate"
                  value={percent}
                  aria-label={`${role} filled`}
                  sx={{
                    backgroundColor: colors.status.neutralSurface,
                    '& .MuiLinearProgress-bar': {
                      backgroundColor: colors.status.success,
                    },
                  }}
                />
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
};

export default ProjectTeamCard;
