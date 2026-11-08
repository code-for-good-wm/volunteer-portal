import Button from '@mui/material/Button';

import StatusChip from '../../../components/elements/StatusChip';
import { roleLabels } from '../../../helpers/roles';
import { colors } from '../../../material/colors';
import { Position } from '../../../types/position';
import { Slot, SlotStatus } from '../../../types/slot';

const isFilled = (status: SlotStatus) =>
  status === 'confirmed' || status === 'confirmed-partial';

const peopleNeeded = (count: number) =>
  `${count} ${count === 1 ? 'person' : 'people'} needed`;

type PositionsListProps = {
  positions: Position[];
  /** Slots for these positions (others are ignored). */
  slots: Slot[];
  onAddPosition: () => void;
  onEditPosition: (position: Position) => void;
};

/** The project's positions as cards, each showing how many of its slots are filled. */
const PositionsList = ({
  positions,
  slots,
  onAddPosition,
  onEditPosition,
}: PositionsListProps) => {
  const filledByPosition = new Map<string, number>();
  for (const slot of slots) {
    if (isFilled(slot.status)) {
      filledByPosition.set(
        slot.position,
        (filledByPosition.get(slot.position) ?? 0) + 1,
      );
    }
  }

  return (
    <section aria-labelledby="positions-heading" style={{ marginTop: 24 }}>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: 16,
          marginBottom: 20,
        }}
      >
        <h2
          id="positions-heading"
          className="highlight"
          style={{
            margin: 0,
            fontSize: '2rem',
            textAlign: 'left',
            textTransform: 'lowercase',
          }}
        >
          Positions
        </h2>
        <Button
          variant="outlined"
          onClick={onAddPosition}
          sx={{
            borderColor: colors.primary.dark,
            color: colors.primary.dark,
            px: 3,
            py: 1.25,
          }}
        >
          + Add position
        </Button>
      </div>

      {positions.map((position) => {
        const role = roleLabels[position.role] ?? position.role;
        const filled = filledByPosition.get(position._id) ?? 0;
        const isFull = filled >= position.slotCount;

        return (
          <article
            key={position._id}
            aria-label={role}
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              gap: 24,
              backgroundColor: colors.surface.card,
              borderRadius: 5,
              padding: '28px 40px',
              boxShadow:
                '0px 1px 10px 0px rgba(0,0,0,0.06), 0px 3px 5px 0px rgba(0,0,0,0.1)',
              marginBottom: 24,
            }}
          >
            <div style={{ minWidth: 0 }}>
              <h3
                style={{
                  margin: '0 0 8px',
                  color: colors.text.primary,
                  fontSize: '1.4rem',
                }}
              >
                {role}
              </h3>
              <p
                style={{
                  margin: 0,
                  color: colors.text.secondary,
                  fontSize: 15,
                }}
              >
                {[peopleNeeded(position.slotCount), position.notes]
                  .filter(Boolean)
                  .join(' · ')}
              </p>
            </div>
            <div
              style={{
                flexShrink: 0,
                display: 'flex',
                alignItems: 'center',
                gap: 16,
              }}
            >
              <StatusChip
                label={`${filled} of ${position.slotCount} filled`}
                theme={isFull ? 'success' : 'warning'}
              />
              <Button
                onClick={() => onEditPosition(position)}
                aria-label={`Edit ${role}`}
                sx={{
                  color: colors.text.primary,
                  textTransform: 'none',
                  fontSize: 17,
                  minWidth: 0,
                }}
              >
                Edit
              </Button>
            </div>
          </article>
        );
      })}
    </section>
  );
};

export default PositionsList;
