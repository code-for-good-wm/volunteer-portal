import PageLayout from '../../../layouts/PageLayout';

import { useNavigate, useParams } from 'react-router-dom';

import { colors } from '../../../material/colors';
import { useAppSelector } from '../../../store/hooks';
import { selectProjectById } from '../../../store/projectsSlice';
import { selectNonprofitById } from '../../../store/nonprofitsSlice';
import { selectEventById } from '../../../store/eventsSlice';
import { selectAllPositions } from '../../../store/positionsSlice';
import { useEffect, useMemo, useRef } from 'react';
import { selectAllSlots } from '../../../store/slotsSlice';
import { RootState } from '../../../store/store';
import { loadSlotsForPosition } from '../../../services/slot';

const TeamSelection = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();

  const project = useAppSelector((state: RootState) =>
    projectId ? selectProjectById(state, projectId) : undefined,
  );
  const nonprofit = useAppSelector((state: RootState) =>
    project?.nonprofit
      ? selectNonprofitById(state, project.nonprofit)
      : undefined,
  );
  const event = useAppSelector((state: RootState) =>
    project?.event ? selectEventById(state, project.event) : undefined,
  );
  const allPositions = useAppSelector(selectAllPositions);
  const allSlots = useAppSelector(selectAllSlots);

  const fetchedPositionSlots = useRef(new Set<string>());

  const positions = useMemo(
    () => allPositions.filter((p) => p.project === projectId),
    [allPositions, projectId],
  );

  useEffect(() => {
    positions.forEach((position) => {
      if (!fetchedPositionSlots.current.has(position._id)) {
        fetchedPositionSlots.current.add(position._id);
        loadSlotsForPosition(position._id);
      }
    });
  }, [positions]);

  const { totalSlots, filledSlots, openSlots } = useMemo(() => {
    const positionIds = new Set(positions.map((p) => p._id));
    const slots = allSlots.filter((s) => positionIds.has(s.position));
    const totalSlots = positions.reduce((sum, p) => sum + p.slotCount, 0);
    const filledSlots = slots.filter(
      (s) => s.status === 'confirmed' || s.status === 'confirmed-partial',
    ).length;
    const awaitingReplySlots = slots.filter(
      (s) => s.status === 'invited',
    ).length;
    return {
      totalSlots,
      filledSlots,
      invitationsSent: slots.filter((s) => !!s.invitedAt).length,
      awaitingReplySlots,
      openSlots: Math.max(totalSlots - filledSlots - awaitingReplySlots, 0),
    };
  }, [positions, allSlots]);

  const groupedPositions = useMemo(() => {
    const groups = new Map<
      string,
      { role: string; positions: typeof positions }
    >();

    positions.forEach((position) => {
      const role = position.role || 'Role';
      const existing = groups.get(role);

      if (existing) {
        existing.positions.push(position);
        return;
      }

      groups.set(role, { role, positions: [position] });
    });

    return Array.from(groups.values()).sort((a, b) =>
      a.role.localeCompare(b.role),
    );
  }, [positions]);

  const getRoleRequirements = (role: string) => {
    const normalizedRole = role.toLowerCase();

    if (normalizedRole.includes('developer')) {
      return 'Needs React · Familiar';
    }

    if (normalizedRole.includes('designer')) {
      return 'Needs UX design · Very Familiar';
    }

    if (normalizedRole.includes('team')) {
      return 'Needs Team lead, Very Familiar';
    }

    return 'Needs experience · Familiar';
  };

  const getSlotState = (slot: any) => {
    if (slot?.status === 'invited') {
      return {
        label: 'Selecting',
        tone: 'filled',
        buttonStyle: { backgroundColor: '#2E6E75', color: '#FFFFFF' },
      };
    }

    if (slot?.status === 'confirmed' || slot?.status === 'confirmed-partial') {
      return {
        label: 'Filled',
        tone: 'filled',
        buttonStyle: { backgroundColor: '#D9E9EB', color: '#2E6E75' },
      };
    }

    return {
      label: 'Open',
      tone: 'open',
      buttonStyle: { backgroundColor: '#D8D8D8', color: '#333333' },
    };
  };

  return (
    <PageLayout>
      <div className="fullViewContainer">
        <div className="gutters">
          <a
            onClick={() => navigate(`/projects/${projectId}`)}
            style={{
              cursor: 'pointer',
              color: colors.text.secondary,
              fontSize: 15,
            }}
          >
            ← {project?.name} - {nonprofit?.name}
          </a>

          <h1 style={{ textAlign: 'center', color: colors.teal.main }}>
            team selection
          </h1>

          <div>
            <div
              className="fullViewContainer"
              style={{
                backgroundColor: '#F5F5F5',
                minHeight: '100vh',
                paddingTop: 16,
              }}
            >
              <div
                className="gutters"
                style={{ maxWidth: 820, margin: '0 auto' }}
              >
                <div
                  style={{
                    backgroundColor: colors.surface.card,
                    borderRadius: 8,
                    padding: '14px 20px 10px',
                    boxShadow:
                      '0px 1px 10px 0px rgba(0,0,0,0.06), 0px 3px 5px 0px rgba(0,0,0,0.08)',
                  }}
                >
                  <h2
                    style={{
                      margin: 0,
                      color: colors.text.primary,
                      fontSize: 28,
                      lineHeight: 1.2,
                      fontWeight: 400,
                    }}
                  >
                    Positions &amp; slots
                  </h2>
                  <div
                    style={{
                      marginTop: 2,
                      color: colors.text.secondary,
                      fontSize: 14,
                      lineHeight: 1.5,
                    }}
                  >
                    {filledSlots} of {totalSlots} slots filled
                  </div>

                  {groupedPositions.length === 0 ? (
                    <div
                      style={{
                        marginTop: 24,
                        color: colors.text.secondary,
                        fontSize: 14,
                      }}
                    >
                      No positions have been added yet.
                    </div>
                  ) : (
                    groupedPositions.map(
                      ({ role, positions: rolePositions }) => {
                        const roleTotalSlots = rolePositions.reduce(
                          (sum, position) => sum + position.slotCount,
                          0,
                        );
                        const roleFilledSlots = rolePositions.reduce(
                          (sum, position) => {
                            const slots = allSlots.filter(
                              (slot) => slot.position === position._id,
                            );
                            return (
                              sum +
                              slots.filter(
                                (slot) =>
                                  slot.status === 'confirmed' ||
                                  slot.status === 'confirmed-partial',
                              ).length
                            );
                          },
                          0,
                        );

                        return (
                          <div key={role} style={{ marginTop: 18 }}>
                            <div
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 8,
                                color: colors.text.secondary,
                                fontWeight: 700,
                                letterSpacing: '0.08em',
                                textTransform: 'uppercase',
                                fontSize: 12,
                                lineHeight: 1.4,
                                marginBottom: 8,
                              }}
                            >
                              <span>{role}</span>
                              <span
                                style={{
                                  fontWeight: 400,
                                  letterSpacing: '0.04em',
                                }}
                              >
                                {roleFilledSlots} of {roleTotalSlots}
                              </span>
                            </div>

                            {rolePositions.map((position) => {
                              const slots = allSlots.filter(
                                (slot) => slot.position === position._id,
                              );

                              return Array.from(
                                { length: position.slotCount },
                                (_, index) => {
                                  const slot = slots[index] ?? {
                                    status: 'open',
                                    _id: `${position._id}-${index}`,
                                  };
                                  const slotState = getSlotState(slot);
                                  const isHighlighted =
                                    slot?.status === 'invited';

                                  return (
                                    <div
                                      key={`${position._id}-${index}`}
                                      style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'space-between',
                                        gap: 16,
                                        minHeight: 52,
                                        borderTop: '1px solid #F0F0F0',
                                        padding: '10px 0',
                                        backgroundColor: isHighlighted
                                          ? '#DDECEF'
                                          : 'transparent',
                                        borderRadius: isHighlighted ? 4 : 0,
                                        paddingLeft: isHighlighted ? 12 : 0,
                                        paddingRight: isHighlighted ? 12 : 0,
                                      }}
                                    >
                                      <div style={{ minWidth: 0, flex: 1 }}>
                                        <div
                                          style={{
                                            color: colors.text.primary,
                                            fontSize: 15,
                                            lineHeight: 1.4,
                                            fontWeight: 500,
                                          }}
                                        >
                                          Slot {index + 1} — {slotState.label}
                                        </div>
                                        <div
                                          style={{
                                            color: colors.text.secondary,
                                            fontSize: 12,
                                            lineHeight: 1.5,
                                            marginTop: 2,
                                          }}
                                        >
                                          {slot?.partialDetail ||
                                            getRoleRequirements(role)}
                                        </div>
                                      </div>

                                      <div
                                        style={{
                                          ...slotState.buttonStyle,
                                          minWidth: 86,
                                          height: 30,
                                          padding: '0 16px',
                                          borderRadius: 16,
                                          display: 'inline-flex',
                                          alignItems: 'center',
                                          justifyContent: 'center',
                                          fontSize: 12,
                                          lineHeight: 1,
                                          fontWeight: 600,
                                          whiteSpace: 'nowrap',
                                        }}
                                      >
                                        {slotState.label}
                                      </div>
                                    </div>
                                  );
                                },
                              );
                            })}
                          </div>
                        );
                      },
                    )
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </PageLayout>
  );
};

export default TeamSelection;
