import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import Divider from '@mui/material/Divider';
import Grid from '@mui/material/Grid';
import LinearProgress from '@mui/material/LinearProgress';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import Tooltip from '@mui/material/Tooltip';

import { useAppDispatch, useAppSelector } from '../../../store/hooks';
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
import { updateAlert } from '../../../store/alertSlice';
import { ProjectStatus } from '../../../types/project';
import PageLayout from '../../../layouts/PageLayout';
import StatusChip, { StatusChipTheme } from '../../../components/elements/StatusChip';
import { colors } from '../../../material/colors';

const statusDisplay: Record<ProjectStatus, { label: string, theme: StatusChipTheme }> = {
  proposed: { label: 'Proposed', theme: 'teal' },
  accepted: { label: 'Accepted', theme: 'success' },
  rejected: { label: 'Declined', theme: 'error' },
  archived: { label: 'Archived', theme: 'neutral' },
};

const formatFullDate = (isoDate?: string) => {
  if (!isoDate) { return '—'; }
  return new Date(isoDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

const formatDateRange = (startIso?: string, endIso?: string) => {
  if (!startIso || !endIso) { return null; }
  const start = new Date(startIso);
  const end = new Date(endIso);
  const startMonth = start.toLocaleDateString('en-US', { month: 'short' });
  const endMonth = end.toLocaleDateString('en-US', { month: 'short' });
  const year = end.getFullYear();
  return startMonth === endMonth
    ? `${startMonth} ${start.getDate()} – ${end.getDate()}, ${year}`
    : `${startMonth} ${start.getDate()} – ${endMonth} ${end.getDate()}, ${year}`;
};

const detailLabelStyle = { color: colors.text.secondary, fontSize: 12, letterSpacing: '0.05em', textTransform: 'uppercase' as const };

const ProjectDetail = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const [changingState, setChangingState] = useState(false);
  const changeStateAnchorRef = useRef<HTMLButtonElement | null>(null);
  const [changeStateMenuOpen, setChangeStateMenuOpen] = useState(false);

  const project = useAppSelector((state: RootState) => projectId ? selectProjectById(state, projectId) : undefined);
  const nonprofit = useAppSelector((state: RootState) => project?.nonprofit ? selectNonprofitById(state, project.nonprofit) : undefined);
  const event = useAppSelector((state: RootState) => project?.event ? selectEventById(state, project.event) : undefined);
  const allPositions = useAppSelector(selectAllPositions);
  const allSlots = useAppSelector(selectAllSlots);

  const fetchedPositionSlots = useRef(new Set<string>());

  useEffect(() => {
    if (!projectId) { return; }
    loadProject(projectId);
    loadAllEvents();
    loadPositionsForProject(projectId);
  }, [projectId]);

  useEffect(() => {
    if (project?.nonprofit) {
      loadNonprofit(project.nonprofit);
    }
  }, [project?.nonprofit]);

  const positions = useMemo(() => allPositions.filter(p => p.project === projectId), [allPositions, projectId]);

  useEffect(() => {
    positions.forEach(position => {
      if (!fetchedPositionSlots.current.has(position._id)) {
        fetchedPositionSlots.current.add(position._id);
        loadSlotsForPosition(position._id);
      }
    });
  }, [positions]);

  const { totalSlots, filledSlots, invitationsSent } = useMemo(() => {
    const positionIds = new Set(positions.map(p => p._id));
    const slots = allSlots.filter(s => positionIds.has(s.position));
    return {
      totalSlots: positions.reduce((sum, p) => sum + p.slotCount, 0),
      filledSlots: slots.filter(s => s.status === 'confirmed' || s.status === 'confirmed-partial').length,
      invitationsSent: slots.filter(s => !!s.invitedAt).length,
    };
  }, [positions, allSlots]);

  const handleEdit = () => {
    if (!projectId) { return; }
    navigate(`/projects/${projectId}/edit`);
  };

  const handleManagePositions = () => {
    dispatch(
      updateAlert({
        visible: true,
        theme: 'info',
        content: 'Managing positions isn\'t available yet.',
      })
    );
  };

  const handleChangeState = (status: ProjectStatus) => {
    if (!projectId) { return; }
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
            style={{ cursor: 'pointer', color: colors.text.secondary, fontSize: 15 }}
          >
            ← Back to projects
          </a>

          <h1 style={{ textAlign: 'center', color: colors.teal.main }}>
            Project
          </h1>

          {!project ? (
            <p style={{ textAlign: 'center', color: colors.text.secondary }}>Loading…</p>
          ) : (
            <>
              <div style={{
                backgroundColor: colors.surface.card,
                borderRadius: 5,
                padding: '28px 40px',
                boxShadow: '0px 1px 10px 0px rgba(0,0,0,0.06), 0px 3px 5px 0px rgba(0,0,0,0.1)',
                marginTop: 24,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
              }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <h2 style={{ color: colors.text.primary, margin: '0 0 4px' }}>{project.name}</h2>
                    <StatusChip label={statusDisplay[project.status].label} theme={statusDisplay[project.status].theme} />
                  </div>
                  {nonprofit && (
                    <p style={{ color: colors.text.secondary, margin: '0 0 16px' }}>with {nonprofit.name}</p>
                  )}
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    {event && <Chip label={event.name} sx={{ backgroundColor: colors.status.neutralSurface }} />}
                    {dateRange && <Chip label={dateRange} sx={{ backgroundColor: colors.status.neutralSurface }} />}
                  </div>
                </div>
                <div style={{ flexShrink: 0, display: 'flex', gap: 8 }}>
                  <Tooltip title={isDeclined ? 'This project has been declined.' : ''}>
                    <span>
                      <Button
                        variant="contained"
                        sx={{ backgroundColor: colors.primary.dark, whiteSpace: 'nowrap' }}
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
                    sx={{ borderColor: colors.primary.dark, color: colors.primary.dark, whiteSpace: 'nowrap' }}
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
                      .filter(status => status !== project.status)
                      .map(status => (
                        <MenuItem key={status} onClick={() => handleChangeState(status)}>
                          {statusDisplay[status].label}
                        </MenuItem>
                      ))}
                  </Menu>
                </div>
              </div>

              <Tabs value="overview" textColor="primary" indicatorColor="primary" sx={{ marginTop: 2 }}>
                <Tab value="overview" label="Overview" />
                <Tab value="positions" label="Positions" disabled />
                <Tab value="team" label="Team" disabled />
                <Tab value="status" label="Status" disabled />
              </Tabs>

              <Grid container spacing={3} sx={{ marginTop: 1 }}>
                <Grid item xs={12} md={4}>
                  {nonprofit && (
                    <div style={{
                      backgroundColor: colors.surface.card,
                      borderRadius: 5,
                      padding: '28px 32px',
                      boxShadow: '0px 1px 10px 0px rgba(0,0,0,0.06), 0px 3px 5px 0px rgba(0,0,0,0.1)',
                      marginBottom: 24,
                    }}>
                      <h2 style={{ color: colors.text.primary, marginTop: 0 }}>Nonprofit</h2>
                      <Divider sx={{ marginBottom: 2 }} />
                      <div style={{ marginBottom: 16 }}>
                        <div style={detailLabelStyle}>Organization</div>
                        <div style={{ color: colors.text.primary }}>{nonprofit.name}</div>
                      </div>
                      <div style={{ marginBottom: 16 }}>
                        <div style={detailLabelStyle}>Primary Contact</div>
                        <div style={{ color: colors.text.primary }}>{nonprofit.contactName} · {nonprofit.contactRole}</div>
                      </div>
                      <div style={{ marginBottom: 16 }}>
                        <div style={detailLabelStyle}>Email</div>
                        <div style={{ color: colors.text.primary }}>{nonprofit.contactEmail}</div>
                      </div>
                      {nonprofit.contactPhone && (
                        <div style={{ marginBottom: 16 }}>
                          <div style={detailLabelStyle}>Phone</div>
                          <div style={{ color: colors.text.primary }}>{nonprofit.contactPhone}</div>
                        </div>
                      )}
                      {nonprofit.website && (
                        <div>
                          <div style={detailLabelStyle}>Website</div>
                          <div style={{ color: colors.text.primary }}>{nonprofit.website}</div>
                        </div>
                      )}
                    </div>
                  )}

                  <div style={{
                    backgroundColor: colors.surface.card,
                    borderRadius: 5,
                    padding: '28px 32px',
                    boxShadow: '0px 1px 10px 0px rgba(0,0,0,0.06), 0px 3px 5px 0px rgba(0,0,0,0.1)',
                  }}>
                    <h2 style={{ color: colors.text.primary, marginTop: 0 }}>At a glance</h2>
                    <Divider sx={{ marginBottom: 2 }} />
                    {[
                      ['Submitted', formatFullDate(project.submittedAt)],
                      ['Status', statusDisplay[project.status].label],
                      ['Event', event?.name ?? 'Not scoped yet'],
                      ['Positions', positions.length],
                      ['Slots filled', `${filledSlots} of ${totalSlots}`],
                      ['Invitations sent', invitationsSent],
                      ['Last updated', formatFullDate(project.updatedDate)],
                      ...(project.reference ? [['Reference', project.reference]] : []),
                      ['Source', project.reference ? 'Public form' : 'Manual entry'],
                    ].map(([label, value]) => (
                      <div key={label} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', color: colors.text.secondary }}>
                        <span>{label}</span>
                        <span style={{ color: colors.text.primary }}>{value}</span>
                      </div>
                    ))}
                  </div>
                </Grid>

                <Grid item xs={12} md={8}>
                  <div style={{
                    backgroundColor: colors.surface.card,
                    borderRadius: 5,
                    padding: '28px 32px',
                    boxShadow: '0px 1px 10px 0px rgba(0,0,0,0.06), 0px 3px 5px 0px rgba(0,0,0,0.1)',
                    marginBottom: 24,
                  }}>
                    <h2 style={{ color: colors.text.primary, margin: 0 }}>Project details</h2>
                    <Divider sx={{ margin: '16px 0' }} />
                    <div style={detailLabelStyle}>Description</div>
                    <p style={{ color: colors.text.primary, marginTop: 4 }}>{project.description}</p>
                    {project.successCriteria && (
                      <>
                        <Divider sx={{ margin: '16px 0' }} />
                        <div style={detailLabelStyle}>Goals</div>
                        <p style={{ color: colors.text.primary, marginTop: 4, whiteSpace: 'pre-line' }}>{project.successCriteria}</p>
                      </>
                    )}
                  </div>

                  <div style={{
                    backgroundColor: colors.surface.card,
                    borderRadius: 5,
                    padding: '28px 32px',
                    boxShadow: '0px 1px 10px 0px rgba(0,0,0,0.06), 0px 3px 5px 0px rgba(0,0,0,0.1)',
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <h2 style={{ color: colors.text.primary, margin: 0 }}>Project team</h2>
                      <a
                        onClick={isDeclined ? undefined : handleManagePositions}
                        style={{
                          cursor: isDeclined ? 'default' : 'pointer',
                          color: isDeclined ? colors.text.placeholder : colors.teal.deep,
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
                          '& .MuiLinearProgress-bar': { backgroundColor: colors.status.success },
                        }}
                      />
                    )}
                  </div>
                </Grid>
              </Grid>
            </>
          )}
        </div>
      </div>
    </PageLayout>
  );
};

export default ProjectDetail;
