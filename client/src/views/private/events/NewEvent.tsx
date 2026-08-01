import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import Alert from '@mui/material/Alert';
import Chip from '@mui/material/Chip';
import Grid from '@mui/material/Grid';

import { useAppSelector } from '../../../store/hooks';
import { selectAllPrograms } from '../../../store/programsSlice';
import { EventCreate, EventType } from '../../../types/event';
import { loadPrograms } from '../../../services/program';
import { createEvent } from '../../../services/event';
import PageLayout from '../../../layouts/PageLayout';
import StandardButton from '../../../components/buttons/StandardButton';
import { statusChipProps } from '../../../helpers/eventStatus';
import EventFormFields, { EventFormState, initialEventFormState, isEventFormValid } from './EventFormFields';

const NewEvent = () => {
  const navigate = useNavigate();

  const programs = useAppSelector(selectAllPrograms);

  const [form, setForm] = useState<EventFormState>(initialEventFormState);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    loadPrograms();
  }, []);

  const handleChange = (field: keyof EventFormState, value: string | boolean) => {
    setForm((prevState) => ({
      ...prevState,
      [field]: value,
    }));
  };

  const isValid = isEventFormValid(form);

  const handleCancel = () => {
    navigate('/events');
  };

  const handleSave = () => {
    if (!isValid || processing) {
      return;
    }

    // New events always start as drafts; publishing happens from the event page.
    const eventCreate: EventCreate = {
      program: form.program,
      name: form.name.trim(),
      description: form.description.trim(),
      additionalInfo: form.additionalInfo.trim(),
      startDate: new Date(form.startDate).toISOString(),
      endDate: new Date(form.endDate).toISOString(),
      rsvpDeadline: form.rsvpDeadline ? new Date(form.rsvpDeadline).toISOString() : undefined,
      location: form.location.trim(),
      allowSignUps: form.allowSignUps,
      allowPartialAttendance: form.allowPartialAttendance,
      allocationRequired: form.allocationRequired,
      eventType: form.eventType as EventType,
      status: 'draft',
    };

    setProcessing(true);

    createEvent({
      eventCreate,
      success: (newEvent) => navigate(`/events/${newEvent._id}`),
      failure: () => setProcessing(false),
    });
  };

  return (
    <PageLayout>
      <div className="viewContainer">
        <div className="gutters">
          <div className="mb-1">
            <Link to="/events" className="link">
              ← Back to events
            </Link>
          </div>

          <h1>
            new event
          </h1>

          <div className="contentCard">
            <EventFormFields form={form} programs={programs} onChange={handleChange} />

            <Grid container spacing={3} sx={{ marginTop: 0 }}>
              <Grid item xs={12}>
                <h3>
                  Current state
                </h3>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Chip size="small" variant="outlined" label={statusChipProps.draft.label} color={statusChipProps.draft.color} />
                  <span>Not visible to volunteers yet</span>
                </div>
              </Grid>

              <Grid item xs={12}>
                <Alert severity="info">
                  New events always start as drafts, invisible to volunteers. You can publish it from the event page once you&apos;re ready to go live.
                </Alert>
              </Grid>
            </Grid>

            <Grid container spacing={2} sx={{ marginTop: '0.5rem' }} alignItems="center" justifyContent="space-between">
              <Grid item xs={12} md={3}>
                <StandardButton theme="secondary" label="Cancel" handler={handleCancel} disabled={processing} />
              </Grid>
              <Grid item xs={12} md={3}>
                <StandardButton label="Save as Draft" handler={handleSave} disabled={!isValid || processing} />
              </Grid>
            </Grid>
          </div>
        </div>
      </div>
    </PageLayout>
  );
};

export default NewEvent;
