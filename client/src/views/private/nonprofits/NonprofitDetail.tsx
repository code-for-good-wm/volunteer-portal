import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import Divider from '@mui/material/Divider';
import Grid from '@mui/material/Grid';
import Tooltip from '@mui/material/Tooltip';

import { useAppSelector } from '../../../store/hooks';
import { selectNonprofitById } from '../../../store/nonprofitsSlice';
import { selectAllProjects } from '../../../store/projectsSlice';
import { selectEventById } from '../../../store/eventsSlice';
import { loadNonprofit, updateNonprofit } from '../../../services/nonprofit';
import { loadProjectsForNonprofit } from '../../../services/project';
import { loadAllEvents } from '../../../services/event';
import { updateAlert } from '../../../store/alertSlice';
import { useAppDispatch } from '../../../store/hooks';
import { Project } from '../../../types/project';
import { Is501c3Status } from '../../../types/nonprofit';
import PageLayout from '../../../layouts/PageLayout';
import StatusChip, { StatusChipTheme } from '../../../components/elements/StatusChip';
import { colors } from '../../../material/colors';
import { usStateAbbreviations } from '../../../helpers/constants';
import { RootState } from '../../../store/store';

const nonprofitStatusDisplay: Record<string, { label: string, theme: StatusChipTheme }> = {
  interested: { label: 'Interested', theme: 'teal' },
  accepted: { label: 'Accepted', theme: 'success' },
  archived: { label: 'Archived', theme: 'neutral' },
};

const is501c3Label = (status: Is501c3Status) => {
  switch (status) {
  case 'yes': return 'Registered 501(c)(3)';
  case 'in-progress': return '501(c)(3) in progress';
  case 'no': return 'Not a 501(c)(3)';
  }
};

const ProjectHistoryRow = (props: { project: Project }) => {
  const { project } = props;
  const navigate = useNavigate();
  const event = useAppSelector((state: RootState) => project.event ? selectEventById(state, project.event) : undefined);

  const { label, theme }: { label: string, theme: StatusChipTheme } = useMemo(() => {
    switch (project.status) {
    case 'proposed':
      return { label: 'Proposed', theme: 'teal' };
    case 'accepted': {
      const isPast = event?.endDate ? new Date(event.endDate) < new Date() : false;
      return isPast ? { label: 'Completed', theme: 'success' } : { label: 'Accepted', theme: 'success' };
    }
    case 'rejected':
      return { label: 'Declined', theme: 'neutral' };
    case 'archived':
      return { label: 'Archived', theme: 'neutral' };
    }
  }, [project.status, event]);

  return (
    <div style={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '16px 0',
      borderTop: `1px solid ${colors.border.subtle}`,
    }}>
      <div>
        <div
          onClick={() => navigate(`/projects/${project._id}`)}
          style={{ textDecoration: 'underline', color: colors.text.primary, fontWeight: 500, cursor: 'pointer' }}
        >
          {project.name}
        </div>
        <div style={{ color: colors.text.secondary, fontSize: 14 }}>
          {event?.name ?? '—'}
        </div>
      </div>
      <StatusChip label={label} theme={theme} />
    </div>
  );
};

const NonprofitDetail = () => {
  const { nonprofitId } = useParams<{ nonprofitId: string }>();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const [accepting, setAccepting] = useState(false);

  const nonprofit = useAppSelector((state: RootState) => nonprofitId ? selectNonprofitById(state, nonprofitId) : undefined);
  const allProjects = useAppSelector(selectAllProjects);

  const projects = useMemo(() => {
    return allProjects
      .filter(p => p.nonprofit === nonprofitId)
      .sort((a, b) => (b.submittedAt ?? '').localeCompare(a.submittedAt ?? ''));
  }, [allProjects, nonprofitId]);

  useEffect(() => {
    if (!nonprofitId) { return; }
    loadNonprofit(nonprofitId);
    loadProjectsForNonprofit(nonprofitId);
    loadAllEvents();
  }, [nonprofitId]);

  const handleAddProject = () => {
    navigate(`/projects/new?nonprofitId=${nonprofitId}`);
  };

  const handleAccept = () => {
    if (!nonprofitId) { return; }

    const success = () => {
      setAccepting(false);
      dispatch(
        updateAlert({
          visible: true,
          theme: 'success',
          content: 'Nonprofit accepted.',
        })
      );
    };

    const failure = () => {
      setAccepting(false);
    };

    setAccepting(true);

    updateNonprofit(nonprofitId, { status: 'accepted' }, { success, failure });
  };

  if (!nonprofitId) {
    return null;
  }

  return (
    <PageLayout>
      <div className="fullViewContainer">
        <div className="gutters">
          <a
            onClick={() => navigate('/nonprofits')}
            style={{ cursor: 'pointer', color: colors.text.secondary, fontSize: 15 }}
          >
            ← Back to nonprofits
          </a>

          <h1 style={{ textAlign: 'center', color: colors.teal.main }}>
            Nonprofit
          </h1>

          {!nonprofit ? (
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
                    <h2 style={{ color: colors.text.primary, margin: '0 0 4px' }}>{nonprofit.name}</h2>
                    <StatusChip
                      label={nonprofitStatusDisplay[nonprofit.status].label}
                      theme={nonprofitStatusDisplay[nonprofit.status].theme}
                    />
                  </div>
                  {nonprofit.website && (
                    <a
                      href={nonprofit.website.startsWith('http') ? nonprofit.website : `https://${nonprofit.website}`}
                      target="_blank"
                      rel="noreferrer"
                      style={{ color: colors.text.secondary, fontSize: 15 }}
                    >
                      {nonprofit.website}
                    </a>
                  )}
                  <div style={{ marginTop: 16, display: 'flex', gap: 8 }}>
                    <Chip label={is501c3Label(nonprofit.is501c3)} sx={{ backgroundColor: colors.status.neutralSurface }} />
                    {nonprofit.einNumber && (
                      <Chip label={`EIN ${nonprofit.einNumber}`} sx={{ backgroundColor: colors.status.neutralSurface }} />
                    )}
                    <Chip
                      label={`${nonprofit.city}, ${usStateAbbreviations[nonprofit.state] ?? nonprofit.state}`}
                      sx={{ backgroundColor: colors.status.neutralSurface }}
                    />
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
                  <Button
                    variant="outlined"
                    sx={{ borderColor: colors.primary.dark, color: colors.primary.dark, whiteSpace: 'nowrap' }}
                    onClick={() => navigate(`/nonprofits/${nonprofitId}/edit`)}
                  >
                    Edit
                  </Button>
                  {nonprofit.status === 'interested' && (
                    <Button
                      variant="contained"
                      sx={{ backgroundColor: colors.status.success, whiteSpace: 'nowrap' }}
                      onClick={handleAccept}
                      disabled={accepting}
                    >
                      Accept Nonprofit
                    </Button>
                  )}
                </div>
              </div>

              <Grid container spacing={3} sx={{ marginTop: 1 }}>
                <Grid item xs={12} md={8}>
                  <div style={{
                    backgroundColor: colors.surface.card,
                    borderRadius: 5,
                    padding: '28px 32px',
                    boxShadow: '0px 1px 10px 0px rgba(0,0,0,0.06), 0px 3px 5px 0px rgba(0,0,0,0.1)',
                    marginBottom: 24,
                  }}>
                    <h2 style={{ color: colors.text.primary, marginTop: 0 }}>About the organization</h2>
                    <Divider sx={{ marginBottom: 2 }} />
                    <p style={{ color: colors.text.primary }}>{nonprofit.description}</p>
                  </div>

                  <div style={{
                    backgroundColor: colors.surface.card,
                    borderRadius: 5,
                    padding: '28px 32px',
                    boxShadow: '0px 1px 10px 0px rgba(0,0,0,0.06), 0px 3px 5px 0px rgba(0,0,0,0.1)',
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <h2 style={{ color: colors.text.primary, margin: 0 }}>Project history</h2>
                      <Tooltip
                        title={nonprofit.status === 'accepted' ? '' : 'This nonprofit must be accepted before a project can be added.'}
                      >
                        <span>
                          <Button
                            variant="contained"
                            size="small"
                            sx={{ backgroundColor: colors.primary.dark }}
                            onClick={handleAddProject}
                            disabled={nonprofit.status !== 'accepted'}
                          >
                            Add New Project
                          </Button>
                        </span>
                      </Tooltip>
                    </div>
                    <Divider sx={{ marginTop: 2 }} />
                    {projects.length === 0 ? (
                      <p style={{ color: colors.text.secondary, paddingTop: 16 }}>
                        No projects yet for this organization.
                      </p>
                    ) : (
                      projects.map(project => (
                        <ProjectHistoryRow key={project._id} project={project} />
                      ))
                    )}
                  </div>
                </Grid>

                <Grid item xs={12} md={4}>
                  <div style={{
                    backgroundColor: colors.surface.card,
                    borderRadius: 5,
                    padding: '28px 32px',
                    boxShadow: '0px 1px 10px 0px rgba(0,0,0,0.06), 0px 3px 5px 0px rgba(0,0,0,0.1)',
                  }}>
                    <h2 style={{ color: colors.text.primary, marginTop: 0 }}>Contact</h2>
                    <Divider sx={{ marginBottom: 2 }} />

                    <div style={{ marginBottom: 16 }}>
                      <div style={{ color: colors.text.secondary, fontSize: 12, letterSpacing: '0.05em', textTransform: 'uppercase' }}>Name</div>
                      <div style={{ color: colors.text.primary }}>{nonprofit.contactName}</div>
                    </div>
                    <div style={{ marginBottom: 16 }}>
                      <div style={{ color: colors.text.secondary, fontSize: 12, letterSpacing: '0.05em', textTransform: 'uppercase' }}>Role</div>
                      <div style={{ color: colors.text.primary }}>{nonprofit.contactRole}</div>
                    </div>
                    <div style={{ marginBottom: 16 }}>
                      <div style={{ color: colors.text.secondary, fontSize: 12, letterSpacing: '0.05em', textTransform: 'uppercase' }}>Email</div>
                      <div style={{ color: colors.text.primary }}>{nonprofit.contactEmail}</div>
                    </div>
                    { nonprofit.contactPhone && (
                      <div>
                        <div style={{ color: colors.text.secondary, fontSize: 12, letterSpacing: '0.05em', textTransform: 'uppercase' }}>Phone</div>
                        <div style={{ color: colors.text.primary }}>{nonprofit.contactPhone}</div>
                      </div>
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

export default NonprofitDetail;
