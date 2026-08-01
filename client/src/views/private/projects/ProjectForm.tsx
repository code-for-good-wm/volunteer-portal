import { ChangeEvent, useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';

import Autocomplete from '@mui/material/Autocomplete';
import Divider from '@mui/material/Divider';
import Grid from '@mui/material/Grid';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';

import { useAppSelector } from '../../../store/hooks';
import { selectAllNonprofits } from '../../../store/nonprofitsSlice';
import { selectAllEvents } from '../../../store/eventsSlice';
import { selectProjectById } from '../../../store/projectsSlice';
import { RootState } from '../../../store/store';
import PageLayout from '../../../layouts/PageLayout';
import StandardButton from '../../../components/buttons/StandardButton';
import TextFieldLabel from '../../../components/elements/TextFieldLabel';
import { brandAssetsStatusOptions, onsiteContactAvailabilityOptions } from '../../../helpers/constants';
import { loadNonprofits } from '../../../services/nonprofit';
import { loadAllEvents } from '../../../services/event';
import { createProject, loadProject, updateProject } from '../../../services/project';
import { BrandAssetsStatus, OnsiteContactAvailability, ProjectCreate, ProjectUpdate } from '../../../types/project';
import { colors } from '../../../material/colors';

type ProjectFormData = {
  nonprofitId: string;
  eventId: string;
  name: string;
  description: string;
  problem: string;
  successCriteria: string;
  whoUsesIt: string;
  existingSystem: string;
  timeline: string;
  brandAssets: BrandAssetsStatus | '';
  onsiteContactAvailability: OnsiteContactAvailability | '';
  onsiteContactName: string;
  notes: string;
};

const initialForm: ProjectFormData = {
  nonprofitId: '',
  eventId: '',
  name: '',
  description: '',
  problem: '',
  successCriteria: '',
  whoUsesIt: '',
  existingSystem: '',
  timeline: '',
  brandAssets: '',
  onsiteContactAvailability: '',
  onsiteContactName: '',
  notes: '',
};

const ProjectForm = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const isEdit = !!projectId;

  const [searchParams] = useSearchParams();
  const preselectedNonprofitId = searchParams.get('nonprofitId') ?? '';

  const [form, setForm] = useState<ProjectFormData>({ ...initialForm, nonprofitId: preselectedNonprofitId });
  const [submitDisabled, setSubmitDisabled] = useState(true);
  const [processing, setProcessing] = useState(false);

  const navigate = useNavigate();

  const nonprofitsData = useAppSelector(selectAllNonprofits);
  const eventsData = useAppSelector(selectAllEvents);
  const existingProject = useAppSelector((state: RootState) =>
    projectId ? selectProjectById(state, projectId) : undefined
  );

  // Only accepted nonprofits can have a project added, matching the rule enforced
  // on the nonprofit detail page's "Add New Project" button.
  const acceptedNonprofits = useMemo(() => nonprofitsData.filter(n => n.status === 'accepted'), [nonprofitsData]);

  useEffect(() => {
    loadNonprofits();
    loadAllEvents();
    if (projectId) {
      loadProject(projectId);
    }
  }, [projectId]);

  useEffect(() => {
    if (!existingProject) { return; }

    setForm({
      nonprofitId: existingProject.nonprofit,
      eventId: existingProject.event ?? '',
      name: existingProject.name,
      description: existingProject.description,
      problem: existingProject.problem,
      successCriteria: existingProject.successCriteria ?? '',
      whoUsesIt: existingProject.whoUsesIt ?? '',
      existingSystem: existingProject.existingSystem ?? '',
      timeline: existingProject.timeline ?? '',
      brandAssets: existingProject.brandAssets ?? '',
      onsiteContactAvailability: existingProject.onsiteContactAvailability ?? '',
      onsiteContactName: existingProject.onsiteContactName ?? '',
      notes: existingProject.notes ?? '',
    });
  }, [existingProject]);

  useEffect(() => {
    const { nonprofitId, eventId, name, description, problem } = form;
    setSubmitDisabled(!(nonprofitId && eventId && name.trim() && description.trim() && problem.trim()));
  }, [form]);

  const handleField = (field: keyof ProjectFormData) => (event: ChangeEvent<HTMLInputElement>) => {
    const { value } = event.target;
    setForm((prevState) => ({
      ...prevState,
      [field]: value,
    }));
  };

  const backTarget = '/projects';

  const handleCancel = () => {
    navigate(-1);
  };

  const buildProjectFields = () => ({
    nonprofit: form.nonprofitId,
    event: form.eventId || undefined,
    name: form.name.trim(),
    description: form.description.trim(),
    problem: form.problem.trim(),
    successCriteria: form.successCriteria.trim() || undefined,
    whoUsesIt: form.whoUsesIt.trim() || undefined,
    existingSystem: form.existingSystem.trim() || undefined,
    timeline: form.timeline.trim() || undefined,
    brandAssets: form.brandAssets || undefined,
    onsiteContactAvailability: form.onsiteContactAvailability || undefined,
    onsiteContactName: form.onsiteContactName.trim() || undefined,
    notes: form.notes.trim() || undefined,
  });

  const handleSave = () => {
    const success = () => {
      setProcessing(false);
      navigate(backTarget);
    };

    const failure = () => {
      setProcessing(false);
    };

    setProcessing(true);

    if (isEdit && projectId) {
      const projectUpdate: ProjectUpdate = buildProjectFields();
      updateProject(projectId, projectUpdate, { success, failure });
    } else {
      // New projects always start 'proposed'; accepting/declining/archiving
      // happens later from the project detail page.
      const projectCreate: ProjectCreate = { ...buildProjectFields(), status: 'proposed' };
      createProject(projectCreate, { success, failure });
    }
  };

  const selectedNonprofit = acceptedNonprofits.find(n => n._id === form.nonprofitId)
    ?? nonprofitsData.find(n => n._id === form.nonprofitId)
    ?? null;

  return (
    <PageLayout>
      <div className="fullViewContainer">
        <div className="gutters">
          <a
            onClick={() => navigate(-1)}
            style={{ cursor: 'pointer', color: colors.text.secondary, fontSize: 15 }}
          >
            ← Back
          </a>

          <h1 style={{ textAlign: 'center', color: colors.teal.main }}>
            {isEdit ? 'Edit Project' : 'Add a Project'}
          </h1>

          <div style={{
            backgroundColor: colors.surface.card,
            borderRadius: 5,
            padding: '36px 40px',
            boxShadow: '0px 1px 10px 0px rgba(0,0,0,0.06), 0px 3px 5px 0px rgba(0,0,0,0.1)',
            maxWidth: 900,
            margin: '24px auto 0',
          }}>
            <h2 style={{ color: colors.text.primary, marginTop: 0, marginBottom: 4 }}>Nonprofit</h2>
            <p style={{ color: colors.text.secondary, fontSize: 13, marginTop: 0 }}>
              Pick the organization this project is for. Everything else on this form hangs off it.
            </p>

            <Autocomplete
              options={acceptedNonprofits}
              getOptionLabel={(option) => option.name}
              value={selectedNonprofit}
              onChange={(_, value) => setForm(prev => ({ ...prev, nonprofitId: value?._id ?? '' }))}
              disabled={isEdit}
              renderInput={(params) => (
                <TextField {...params} label={<TextFieldLabel label="Select nonprofit" required />} margin="dense" />
              )}
            />
            <p style={{ color: colors.text.secondary, fontSize: 13 }}>
              Don&apos;t see the nonprofit you need?{' '}
              <a
                onClick={() => navigate('/nonprofits/new')}
                style={{ cursor: 'pointer', color: colors.teal.deep }}
              >
                Add a new nonprofit
              </a>
              {' '}(it&apos;ll need to be accepted before you can add a project for it).
            </p>

            <Divider sx={{ margin: '20px 0' }} />

            <h2 style={{ color: colors.text.primary, marginBottom: 4 }}>Project</h2>
            <p style={{ color: colors.text.secondary, fontSize: 13, marginTop: 0 }}>
              What the team would actually build. These are the questions the public request form asks, in the same order.
            </p>

            <Grid container spacing={4}>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  select
                  variant="outlined"
                  margin="dense"
                  label={<TextFieldLabel label="Event" required />}
                  value={form.eventId}
                  onChange={handleField('eventId')}
                  helperText="Projects belong to an event, not a program."
                >
                  {eventsData.map(event => (
                    <MenuItem key={event._id} value={event._id}>{event.name}</MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  variant="outlined"
                  margin="dense"
                  label={<TextFieldLabel label="Project name" required />}
                  value={form.name}
                  onChange={handleField('name')}
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  multiline
                  rows={2}
                  variant="outlined"
                  margin="dense"
                  label={<TextFieldLabel label="What is the project?" required />}
                  value={form.description}
                  onChange={handleField('description')}
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  multiline
                  rows={2}
                  variant="outlined"
                  margin="dense"
                  label={<TextFieldLabel label="What is painful today?" required />}
                  value={form.problem}
                  onChange={handleField('problem')}
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  multiline
                  rows={2}
                  variant="outlined"
                  margin="dense"
                  label={<TextFieldLabel label="What does success look like?" />}
                  value={form.successCriteria}
                  onChange={handleField('successCriteria')}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  variant="outlined"
                  margin="dense"
                  label={<TextFieldLabel label="Who uses it?" />}
                  value={form.whoUsesIt}
                  onChange={handleField('whoUsesIt')}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  variant="outlined"
                  margin="dense"
                  label={<TextFieldLabel label="Existing system" />}
                  value={form.existingSystem}
                  onChange={handleField('existingSystem')}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  variant="outlined"
                  margin="dense"
                  label={<TextFieldLabel label="Timeline" />}
                  value={form.timeline}
                  onChange={handleField('timeline')}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  select
                  variant="outlined"
                  margin="dense"
                  label={<TextFieldLabel label="Brand assets" />}
                  value={form.brandAssets}
                  onChange={handleField('brandAssets')}
                  helperText="Yes · Partial · No"
                >
                  {brandAssetsStatusOptions.map(option => (
                    <MenuItem key={option.id} value={option.id}>{option.label}</MenuItem>
                  ))}
                </TextField>
              </Grid>
            </Grid>

            <Divider sx={{ margin: '20px 0' }} />

            <h2 style={{ color: colors.text.primary, marginBottom: 4 }}>On the day</h2>
            <p style={{ color: colors.text.secondary, fontSize: 13, marginTop: 0 }}>
              Who the team can actually reach while they&apos;re building.
            </p>

            <Grid container spacing={4}>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  select
                  variant="outlined"
                  margin="dense"
                  label={<TextFieldLabel label="Onsite contact" />}
                  value={form.onsiteContactAvailability}
                  onChange={handleField('onsiteContactAvailability')}
                  helperText="In person · Remote · None"
                >
                  {onsiteContactAvailabilityOptions.map(option => (
                    <MenuItem key={option.id} value={option.id}>{option.label}</MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  variant="outlined"
                  margin="dense"
                  label={<TextFieldLabel label="Contact on the day" />}
                  value={form.onsiteContactName}
                  onChange={handleField('onsiteContactName')}
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  multiline
                  rows={2}
                  variant="outlined"
                  margin="dense"
                  label={<TextFieldLabel label="Internal notes" />}
                  value={form.notes}
                  onChange={handleField('notes')}
                  helperText="Admin only. Never shown to volunteers or to the nonprofit."
                />
              </Grid>
            </Grid>

            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 24 }}>
              <StandardButton
                theme="secondary"
                label="Cancel"
                handler={handleCancel}
                disabled={processing}
              />
              <div style={{ flex: 1 }} />
              <div style={{ width: 200 }}>
                <StandardButton
                  label={isEdit ? 'Save Changes' : 'Save as Proposed'}
                  handler={handleSave}
                  disabled={submitDisabled || processing}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </PageLayout>
  );
};

export default ProjectForm;
