import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import Dialog from '@mui/material/Dialog';
import Divider from '@mui/material/Divider';
import Grid from '@mui/material/Grid';
import InputLabel from '@mui/material/InputLabel';
import LinearProgress from '@mui/material/LinearProgress';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import Tooltip from '@mui/material/Tooltip';
import Select, { SelectChangeEvent } from '@mui/material/Select';
import FormHelperText from '@mui/material/FormHelperText';

import { useAppSelector } from '../../../store/hooks';
import { selectProjectById } from '../../../store/projectsSlice';
import { selectNonprofitById } from '../../../store/nonprofitsSlice';
import { selectEventById } from '../../../store/eventsSlice';
import { selectAllPositions } from '../../../store/positionsSlice';
import { selectAllSlots } from '../../../store/slotsSlice';
import { RootState } from '../../../store/store';
import { loadProject, updateProject } from '../../../services/project';
import { loadNonprofit } from '../../../services/nonprofit';
import { loadAllEvents } from '../../../services/event';
import { loadPositionsForProject } from '../../../services/position';
import { loadSlotsForPosition } from '../../../services/slot';
import { ProjectStatus } from '../../../types/project';
import PageLayout from '../../../layouts/PageLayout';
import StatusChip, {
  StatusChipTheme,
} from '../../../components/elements/StatusChip';
import { colors } from '../../../material/colors';
import NumberSpinner from '../../../components/elements/NumberSpinner';

const statusDisplay: Record<
  ProjectStatus,
  { label: string; theme: StatusChipTheme }
> = {
  proposed: { label: 'Proposed', theme: 'teal' },
  accepted: { label: 'Accepted', theme: 'success' },
  rejected: { label: 'Declined', theme: 'error' },
  archived: { label: 'Archived', theme: 'neutral' },
};

const formatFullDate = (isoDate?: string) => {
  if (!isoDate) {
    return '—';
  }
  return new Date(isoDate).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
};

const formatDateRange = (startIso?: string, endIso?: string) => {
  if (!startIso || !endIso) {
    return null;
  }
  const start = new Date(startIso);
  const end = new Date(endIso);
  const startMonth = start.toLocaleDateString('en-US', { month: 'short' });
  const endMonth = end.toLocaleDateString('en-US', { month: 'short' });
  const year = end.getFullYear();
  return startMonth === endMonth
    ? `${startMonth} ${start.getDate()} – ${end.getDate()}, ${year}`
    : `${startMonth} ${start.getDate()} – ${endMonth} ${end.getDate()}, ${year}`;
};

const formatRosterDate = (isoDate?: string) => {
  if (!isoDate) {
    return null;
  }
  return new Date(isoDate).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });
};

const detailLabelStyle = {
  color: colors.text.secondary,
  fontSize: 12,
  letterSpacing: '0.05em',
  textTransform: 'uppercase' as const,
};

const ProjectDetail = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  // const dispatch = useAppDispatch();

  const [changingState, setChangingState] = useState(false);
  const changeStateAnchorRef = useRef<HTMLButtonElement | null>(null);
  const [changeStateMenuOpen, setChangeStateMenuOpen] = useState(false);

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

  const [activeTab, setActiveTab] = useState('overview');

  const [positionModalOpen, setPositionModalOpen] = useState(false);

  useEffect(() => {
    if (!projectId) {
      return;
    }
    loadProject(projectId);
    loadAllEvents();
    loadPositionsForProject(projectId);
  }, [projectId]);

  useEffect(() => {
    if (project?.nonprofit) {
      loadNonprofit(project.nonprofit);
    }
  }, [project?.nonprofit]);

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

  const {
    totalSlots,
    filledSlots,
    invitationsSent,
    awaitingReplySlots,
    openSlots,
  } = useMemo(() => {
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

  const positionGroups = useMemo(() => {
    const groups = new Map<string, typeof positions>();
    positions.forEach((position) => {
      const group = groups.get(position.role) ?? [];
      group.push(position);
      groups.set(position.role, group);
    });
    return [...groups.entries()];
  }, [positions]);

  const handleEdit = () => {
    if (!projectId) {
      return;
    }
    navigate(`/projects/${projectId}/edit`);
  };

  const handleManagePositions = () => {
    setPositionModalOpen(true);
  };

  const handleChangeState = (status: ProjectStatus) => {
    if (!projectId) {
      return;
    }
    setChangeStateMenuOpen(false);

    const success = () => {
      setChangingState(false);
    };

    const failure = () => {
      setChangingState(false);
    };

    setChangingState(true);
    updateProject(projectId, { status }, { success, failure });
  };

  const handleRoleChange = (event: SelectChangeEvent<{ value: unknown }>) => {
    const selectedRole = event.target.value as string;
  };

  if (!projectId) {
    return null;
  }

  const isDeclined = project?.status === 'rejected';
  const dateRange = formatDateRange(event?.startDate, event?.endDate);

  return (
    <PageLayout>
      <div className="fullViewContainer">
        <div className="gutters">
          <a
            onClick={() => navigate('/projects')}
            style={{
              cursor: 'pointer',
              color: colors.text.secondary,
              fontSize: 15,
            }}
          >
            ← Back to projects
          </a>

          <h1 style={{ textAlign: 'center', color: colors.teal.main }}>
            Project
          </h1>

          {!project ? (
            <p style={{ textAlign: 'center', color: colors.text.secondary }}>
              Loading…
            </p>
          ) : (
            <>
              <div
                style={{
                  backgroundColor: colors.surface.card,
                  borderRadius: 5,
                  padding: '28px 40px',
                  boxShadow:
                    '0px 1px 10px 0px rgba(0,0,0,0.06), 0px 3px 5px 0px rgba(0,0,0,0.1)',
                  marginTop: 24,
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                }}
              >
                <div>
                  <div
                    style={{ display: 'flex', alignItems: 'center', gap: 12 }}
                  >
                    <h2
                      style={{ color: colors.text.primary, margin: '0 0 4px' }}
                    >
                      {project.name}
                    </h2>
                    <StatusChip
                      label={statusDisplay[project.status].label}
                      theme={statusDisplay[project.status].theme}
                    />
                  </div>
                  {nonprofit && (
                    <p
                      style={{
                        color: colors.text.secondary,
                        margin: '0 0 16px',
                      }}
                    >
                      with {nonprofit.name}
                    </p>
                  )}
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    {event && (
                      <Chip
                        label={event.name}
                        sx={{ backgroundColor: colors.status.neutralSurface }}
                      />
                    )}
                    {dateRange && (
                      <Chip
                        label={dateRange}
                        sx={{ backgroundColor: colors.status.neutralSurface }}
                      />
                    )}
                  </div>
                </div>
                <div style={{ flexShrink: 0, display: 'flex', gap: 8 }}>
                  <Tooltip
                    title={isDeclined ? 'This project has been declined.' : ''}
                  >
                    <span>
                      <Button
                        variant="contained"
                        sx={{
                          backgroundColor: colors.primary.dark,
                          whiteSpace: 'nowrap',
                        }}
                        onClick={handleEdit}
                        disabled={isDeclined}
                      >
                        Edit
                      </Button>
                    </span>
                  </Tooltip>
                  <Button
                    ref={changeStateAnchorRef}
                    variant="outlined"
                    sx={{
                      borderColor: colors.primary.dark,
                      color: colors.primary.dark,
                      whiteSpace: 'nowrap',
                    }}
                    onClick={() => setChangeStateMenuOpen(true)}
                    disabled={changingState}
                  >
                    Change Status
                  </Button>
                  <Menu
                    anchorEl={changeStateAnchorRef.current}
                    open={changeStateMenuOpen}
                    onClose={() => setChangeStateMenuOpen(false)}
                  >
                    {(Object.keys(statusDisplay) as ProjectStatus[])
                      .filter((status) => status !== project.status)
                      .map((status) => (
                        <MenuItem
                          key={status}
                          onClick={() => handleChangeState(status)}
                        >
                          {statusDisplay[status].label}
                        </MenuItem>
                      ))}
                  </Menu>
                </div>
              </div>

              <Tabs
                value={activeTab}
                onChange={(_, value: string) => setActiveTab(value)}
                textColor="primary"
                indicatorColor="primary"
                sx={{ marginTop: 2 }}
              >
                <Tab value="overview" label="Overview" />
                <Tab value="positions" label="Positions" />
                <Tab value="team" label="Team" />
                <Tab value="status" label="Status" disabled />
              </Tabs>

              {activeTab == 'overview' && (
                <Grid container spacing={3} sx={{ marginTop: 1 }}>
                  <Grid item xs={12} md={4}>
                    {nonprofit && (
                      <div
                        style={{
                          backgroundColor: colors.surface.card,
                          borderRadius: 5,
                          padding: '28px 32px',
                          boxShadow:
                            '0px 1px 10px 0px rgba(0,0,0,0.06), 0px 3px 5px 0px rgba(0,0,0,0.1)',
                          marginBottom: 24,
                        }}
                      >
                        <h2
                          style={{ color: colors.text.primary, marginTop: 0 }}
                        >
                          Nonprofit
                        </h2>
                        <Divider sx={{ marginBottom: 2 }} />
                        <div style={{ marginBottom: 16 }}>
                          <div style={detailLabelStyle}>Organization</div>
                          <div style={{ color: colors.text.primary }}>
                            {nonprofit.name}
                          </div>
                        </div>
                        <div style={{ marginBottom: 16 }}>
                          <div style={detailLabelStyle}>Primary Contact</div>
                          <div style={{ color: colors.text.primary }}>
                            {nonprofit.contactName} · {nonprofit.contactRole}
                          </div>
                        </div>
                        <div style={{ marginBottom: 16 }}>
                          <div style={detailLabelStyle}>Email</div>
                          <div style={{ color: colors.text.primary }}>
                            {nonprofit.contactEmail}
                          </div>
                        </div>
                        {nonprofit.contactPhone && (
                          <div style={{ marginBottom: 16 }}>
                            <div style={detailLabelStyle}>Phone</div>
                            <div style={{ color: colors.text.primary }}>
                              {nonprofit.contactPhone}
                            </div>
                          </div>
                        )}
                        {nonprofit.website && (
                          <div>
                            <div style={detailLabelStyle}>Website</div>
                            <div style={{ color: colors.text.primary }}>
                              {nonprofit.website}
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    <div
                      style={{
                        backgroundColor: colors.surface.card,
                        borderRadius: 5,
                        padding: '28px 32px',
                        boxShadow:
                          '0px 1px 10px 0px rgba(0,0,0,0.06), 0px 3px 5px 0px rgba(0,0,0,0.1)',
                      }}
                    >
                      <h2 style={{ color: colors.text.primary, marginTop: 0 }}>
                        At a glance
                      </h2>
                      <Divider sx={{ marginBottom: 2 }} />
                      {[
                        ['Submitted', formatFullDate(project.submittedAt)],
                        ['Status', statusDisplay[project.status].label],
                        ['Event', event?.name ?? 'Not scoped yet'],
                        ['Positions', positions.length],
                        ['Slots filled', `${filledSlots} of ${totalSlots}`],
                        ['Invitations sent', invitationsSent],
                        ['Last updated', formatFullDate(project.updatedDate)],
                        ...(project.reference
                          ? [['Reference', project.reference]]
                          : []),
                        [
                          'Source',
                          project.reference ? 'Public form' : 'Manual entry',
                        ],
                      ].map(([label, value]) => (
                        <div
                          key={label}
                          style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            padding: '6px 0',
                            color: colors.text.secondary,
                          }}
                        >
                          <span>{label}</span>
                          <span style={{ color: colors.text.primary }}>
                            {value}
                          </span>
                        </div>
                      ))}
                    </div>
                  </Grid>

                  <Grid item xs={12} md={8}>
                    <div
                      style={{
                        backgroundColor: colors.surface.card,
                        borderRadius: 5,
                        padding: '28px 32px',
                        boxShadow:
                          '0px 1px 10px 0px rgba(0,0,0,0.06), 0px 3px 5px 0px rgba(0,0,0,0.1)',
                        marginBottom: 24,
                      }}
                    >
                      <h2 style={{ color: colors.text.primary, margin: 0 }}>
                        Project details
                      </h2>
                      <Divider sx={{ margin: '16px 0' }} />
                      <div style={detailLabelStyle}>Description</div>
                      <p style={{ color: colors.text.primary, marginTop: 4 }}>
                        {project.description}
                      </p>
                      {project.successCriteria && (
                        <>
                          <Divider sx={{ margin: '16px 0' }} />
                          <div style={detailLabelStyle}>Goals</div>
                          <p
                            style={{
                              color: colors.text.primary,
                              marginTop: 4,
                              whiteSpace: 'pre-line',
                            }}
                          >
                            {project.successCriteria}
                          </p>
                        </>
                      )}
                    </div>

                    <div
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
                        }}
                      >
                        <h2 style={{ color: colors.text.primary, margin: 0 }}>
                          Project team
                        </h2>
                        <a
                          onClick={
                            isDeclined ? undefined : handleManagePositions
                          }
                          style={{
                            cursor: isDeclined ? 'default' : 'pointer',
                            color: isDeclined
                              ? colors.text.placeholder
                              : colors.teal.deep,
                          }}
                        >
                          Manage positions →
                        </a>
                      </div>
                      <p style={{ color: colors.text.secondary }}>
                        {totalSlots > 0
                          ? `${filledSlots} of ${totalSlots} slots filled across ${positions.length} position${positions.length === 1 ? '' : 's'}`
                          : 'No positions have been added yet.'}
                      </p>
                      {totalSlots > 0 && (
                        <LinearProgress
                          variant="determinate"
                          value={(filledSlots / totalSlots) * 100}
                          sx={{
                            backgroundColor: colors.status.neutralSurface,
                            '& .MuiLinearProgress-bar': {
                              backgroundColor: colors.status.success,
                            },
                          }}
                        />
                      )}
                    </div>
                  </Grid>
                </Grid>
              )}

              {activeTab == 'positions' && (
                <div>
                  {positions.length === 0 ? (
                    <div
                      style={{
                        backgroundColor: colors.surface.card,
                        borderRadius: 5,
                        padding: '28px 40px',
                        boxShadow:
                          '0px 1px 10px 0px rgba(0,0,0,0.06), 0px 3px 5px 0px rgba(0,0,0,0.1)',
                        marginTop: 24,
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                      }}
                    >
                      <div
                        style={{
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          justifyContent: 'center',
                          textAlign: 'center',
                          minHeight: 360,
                          padding: '24px 0',
                        }}
                      >
                        <div
                          style={{
                            width: 102,
                            height: 102,
                            borderRadius: '50%',
                            backgroundColor: colors.teal.tint,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            marginBottom: 22,
                          }}
                        >
                          <div
                            style={{
                              width: 30,
                              height: 24,
                              display: 'flex',
                              flexDirection: 'column',
                              justifyContent: 'space-between',
                            }}
                          >
                            {[0, 1, 2].map((line) => (
                              <span
                                key={line}
                                style={{
                                  display: 'block',
                                  height: 2,
                                  borderRadius: 2,
                                  backgroundColor: colors.teal.main,
                                  width: line === 2 ? '75%' : '100%',
                                }}
                              />
                            ))}
                          </div>
                        </div>

                        <h2
                          style={{
                            color: colors.text.primary,
                            margin: '0 0 18px',
                            fontWeight: 400,
                            fontSize: '2.1rem',
                          }}
                        >
                          No positions yet
                        </h2>

                        <p
                          style={{
                            maxWidth: 620,
                            margin: '0 0 28px',
                            color: colors.text.secondary,
                            fontSize: '1.1rem',
                            lineHeight: 1.6,
                          }}
                        >
                          A position is a role this project needs filled —
                          Designer, Developer, Support or Lead. Add one and
                          we&apos;ll create a slot for every person it calls
                          for, ready for team selection.
                        </p>

                        <Button
                          variant="contained"
                          onClick={handleManagePositions}
                          sx={{
                            borderColor: colors.primary.dark,
                            whiteSpace: 'nowrap',
                            textTransform: 'uppercase',
                            padding: '25px',
                          }}
                        >
                          + Add Position
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div>Positions list goes here.</div>
                  )}
                </div>
              )}

              {activeTab == 'team' && (
                <div style={{ marginTop: 16 }}>
                  <div
                    style={{
                      backgroundColor: colors.surface.card,
                      borderRadius: 5,
                      padding: '20px 24px',
                      boxShadow:
                        '0px 1px 10px 0px rgba(0,0,0,0.06), 0px 3px 5px 0px rgba(0,0,0,0.1)',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      gap: 20,
                      flexWrap: 'wrap',
                    }}
                  >
                    <div
                      style={{
                        display: 'flex',
                        gap: 36,
                        flexWrap: 'wrap',
                      }}
                    >
                      {[
                        ['Positions total', totalSlots],
                        ['Confirmed', filledSlots],
                        ['Awaiting reply', awaitingReplySlots],
                        ['Still open', openSlots],
                      ].map(([label, value]) => (
                        <div key={label}>
                          <div
                            style={{
                              color: colors.text.primary,
                              fontSize: 20,
                              fontWeight: 700,
                              lineHeight: 1.2,
                            }}
                          >
                            {value}
                          </div>
                          <div
                            style={{
                              color: colors.text.secondary,
                              fontSize: 11,
                              marginTop: 4,
                            }}
                          >
                            {label}
                          </div>
                        </div>
                      ))}
                    </div>
                    <Button
                      variant="contained"
                      disabled
                      sx={{
                        backgroundColor: colors.status.neutralSurface,
                        color: colors.text.secondary,
                        fontSize: 10,
                        letterSpacing: '0.05em',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      Complete team &amp; invite
                    </Button>
                  </div>

                  <div
                    style={{
                      backgroundColor: colors.surface.card,
                      borderRadius: 5,
                      padding: '20px 24px',
                      boxShadow:
                        '0px 1px 10px 0px rgba(0,0,0,0.06), 0px 3px 5px 0px rgba(0,0,0,0.1)',
                      marginTop: 16,
                    }}
                  >
                    <h2
                      style={{
                        color: colors.text.primary,
                        fontSize: 16,
                        margin: '0 0 4px',
                      }}
                    >
                      Roster
                    </h2>
                    <p
                      style={{
                        color: colors.text.secondary,
                        fontSize: 11,
                        margin: 0,
                      }}
                    >
                      Grouped by position. Open slots link straight back to team
                      selection. A volunteer who declines drops off this roster
                      automatically.
                    </p>

                    {positionGroups.length === 0 ? (
                      <p
                        style={{
                          color: colors.text.secondary,
                          margin: '24px 0 4px',
                        }}
                      >
                        No positions have been added to this project yet.
                      </p>
                    ) : (
                      positionGroups.map(([role, rolePositions]) => {
                        const rolePositionIds = new Set(
                          rolePositions.map((position) => position._id),
                        );
                        const roleSlots = allSlots.filter((slot) =>
                          rolePositionIds.has(slot.position),
                        );
                        const roleTotalSlots = rolePositions.reduce(
                          (sum, position) => sum + position.slotCount,
                          0,
                        );
                        const roleFilledSlots = roleSlots.filter(
                          (slot) =>
                            slot.status === 'confirmed' ||
                            slot.status === 'confirmed-partial',
                        ).length;

                        return (
                          <section
                            key={role}
                            aria-label={`${role} positions`}
                            style={{ marginTop: 24 }}
                          >
                            <div
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 8,
                                marginBottom: 8,
                              }}
                            >
                              <span
                                style={{
                                  color: colors.text.secondary,
                                  fontSize: 10,
                                  letterSpacing: '0.08em',
                                  fontWeight: 600,
                                  textTransform: 'uppercase',
                                }}
                              >
                                {role}
                              </span>
                              <Chip
                                size="small"
                                label={`${roleFilledSlots} of ${roleTotalSlots} filled`}
                                sx={{
                                  height: 18,
                                  backgroundColor: '#FFF3D9',
                                  color: '#946200',
                                  fontSize: 9,
                                }}
                              />
                            </div>

                            {rolePositions.map((position) => {
                              const positionSlots = allSlots.filter(
                                (slot) => slot.position === position._id,
                              );

                              return Array.from(
                                { length: position.slotCount },
                                (_, slotIndex) => {
                                  const slot = positionSlots[slotIndex];
                                  const isConfirmed =
                                    slot?.status === 'confirmed' ||
                                    slot?.status === 'confirmed-partial';
                                  const isAwaitingReply =
                                    slot?.status === 'invited';
                                  const isDeclined =
                                    slot?.status === 'declined';
                                  const respondedDate = formatRosterDate(
                                    slot?.respondedAt,
                                  );
                                  const invitedDate = formatRosterDate(
                                    slot?.invitedAt,
                                  );
                                  const description = isConfirmed
                                    ? slot?.status === 'confirmed-partial' &&
                                      slot.partialDetail
                                      ? slot.partialDetail
                                      : 'Volunteer confirmed.'
                                    : isAwaitingReply
                                      ? invitedDate
                                        ? `Invitation sent on ${invitedDate}.`
                                        : 'Invitation sent; awaiting reply.'
                                      : isDeclined
                                        ? respondedDate
                                          ? `Volunteer declined on ${respondedDate}.`
                                          : 'Volunteer declined.'
                                        : 'Not yet assigned.';

                                  return (
                                    <div
                                      key={`${position._id}-${slotIndex}`}
                                      style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: 12,
                                        padding: '8px 0',
                                      }}
                                    >
                                      <div
                                        aria-hidden="true"
                                        style={{
                                          width: 34,
                                          height: 34,
                                          flex: '0 0 34px',
                                          borderRadius: '50%',
                                          border: `1px dashed ${colors.border.default}`,
                                        }}
                                      />
                                      <div style={{ flex: 1, minWidth: 0 }}>
                                        <div
                                          style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: 8,
                                            flexWrap: 'wrap',
                                          }}
                                        >
                                          <span
                                            style={{
                                              color: colors.text.secondary,
                                              fontSize: 12,
                                              fontWeight: 600,
                                            }}
                                          >
                                            Slot {slotIndex + 1} —{' '}
                                            {isConfirmed
                                              ? 'Filled'
                                              : isAwaitingReply
                                                ? 'Awaiting reply'
                                                : 'Empty'}
                                          </span>
                                          <Chip
                                            size="small"
                                            label={
                                              isConfirmed
                                                ? 'Confirmed'
                                                : isAwaitingReply
                                                  ? 'Awaiting reply'
                                                  : 'Open'
                                            }
                                            sx={{
                                              height: 18,
                                              backgroundColor:
                                                colors.status.neutralSurface,
                                              color: colors.text.secondary,
                                              fontSize: 9,
                                            }}
                                          />
                                        </div>
                                        <div
                                          style={{
                                            color: colors.text.secondary,
                                            fontSize: 10,
                                            marginTop: 2,
                                          }}
                                        >
                                          {description}
                                        </div>
                                      </div>
                                      <Button
                                        variant="contained"
                                        onClick={() =>
                                          navigate(
                                            `/projects/${projectId}/team-selection`,
                                          )
                                        }
                                        sx={{
                                          backgroundColor: colors.primary.dark,
                                          color: '#FFFFFF',
                                          fontSize: 9,
                                          letterSpacing: '0.04em',
                                          minWidth: 0,
                                          px: 1.5,
                                          whiteSpace: 'nowrap',
                                        }}
                                      >
                                        Find someone
                                      </Button>
                                    </div>
                                  );
                                },
                              );
                            })}
                          </section>
                        );
                      })
                    )}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      <Dialog
        onClose={() => setPositionModalOpen(false)}
        open={positionModalOpen}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: '12px',
            border: `1px solid ${colors.border.default}`,
            boxShadow: '0 8px 28px rgba(25, 27, 37, 0.12)',
            p: 3,
            overflow: 'visible',
          },
        }}
      >
        <span style={{ fontSize: 14, color: colors.text.secondary }}>
          {project?.name} - {nonprofit?.name}
        </span>
        <hr />
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'minmax(0, 2fr) minmax(220px, 1fr)',
            gap: 32,
            alignItems: 'start',
          }}
        >
          <div>
            <InputLabel
              id="role-label"
              sx={{
                display: 'block',
                mb: 1,
                color: colors.text.primary,
                fontSize: 15,
                fontWeight: 500,
                lineHeight: 1.5,
                '& .required-mark': {
                  color: '#D14343',
                },
              }}
            >
              Role <span className="required-mark">*</span>
            </InputLabel>
            <Select
              labelId="role-label"
              id="role"
              onChange={handleRoleChange}
              displayEmpty
              value=""
              required
              sx={{
                width: '100%',
                minHeight: '52px',
                borderRadius: '10px',
                backgroundColor: colors.surface.card,
                color: colors.text.primary,
                '& .MuiOutlinedInput-notchedOutline': {
                  borderColor: colors.border.default,
                  borderWidth: 1,
                },
                '&:hover .MuiOutlinedInput-notchedOutline': {
                  borderColor: '#c4c7cf',
                },
                '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                  borderColor: colors.primary.main,
                  borderWidth: 1,
                },
                '& .MuiSelect-select': {
                  padding: '14px 16px',
                  fontSize: 15,
                  lineHeight: 1.5,
                  color: colors.text.primary,
                },
              }}
            >
              <MenuItem value="" disabled>
                Select Role
              </MenuItem>
              <MenuItem value="designer">Designer</MenuItem>
              <MenuItem value="developer">Developer</MenuItem>
              <MenuItem value="support">Support</MenuItem>
              <MenuItem value="lead">Lead</MenuItem>
            </Select>
          </div>

          <div>
            <InputLabel
              id="slot-count-label"
              sx={{
                display: 'block',
                mb: 1,
                color: colors.text.primary,
                fontSize: 15,
                fontWeight: 500,
                lineHeight: 1.5,
              }}
            >
              How many people?
            </InputLabel>
            <NumberSpinner
              id="slot-count"
              name="slot-count"
              min={1}
              max={100}
              defaultValue={0}
              required
              sx={{
                width: '100%',
                maxWidth: 220,
                '& .MuiButton-root': {
                  backgroundColor: '#F7F8FA',
                  borderColor: colors.border.default,
                },
                '& .MuiOutlinedInput-root': {
                  borderColor: colors.border.default,
                  borderRadius: 0,
                },
              }}
            />
            <FormHelperText
              sx={{
                mt: 1.5,
                ml: 0,
                color: colors.text.secondary,
                fontSize: 13,
                lineHeight: 1.5,
              }}
            >
              Creates this many open slots on the project.
            </FormHelperText>
          </div>
        </div>
      </Dialog>
    </PageLayout>
  );
};

export default ProjectDetail;
