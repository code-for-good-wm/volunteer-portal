import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';

import Alert from '@mui/material/Alert';
import Chip from '@mui/material/Chip';
import Grid from '@mui/material/Grid';

import { useAppSelector } from '../../../store/hooks';
import { selectAllPrograms } from '../../../store/programsSlice';
import { selectEventById } from '../../../store/eventsSlice';
import { EventType, EventUpdate } from '../../../types/event';
import { loadPrograms } from '../../../services/program';
import { deleteEvent, loadEvent, updateEvent } from '../../../services/event';
import PageLayout from '../../../layouts/PageLayout';
import StandardButton from '../../../components/buttons/StandardButton';
import DialogAlert from '../../../components/elements/DialogAlert';
import { statusChipProps, statusDescriptions } from '../../../helpers/eventStatus';
import EventFormFields, { EventFormState, initialEventFormState, isEventFormValid } from './EventFormFields';

const EditEvent = () => {
  const navigate = useNavigate();
  const { eventId } = useParams<{ eventId: string }>();

  const programs = useAppSelector(selectAllPrograms);
  const event = useAppSelector((state) => eventId ? selectEventById(state, eventId) : undefined);

  const [form, setForm] = useState<EventFormState>(initialEventFormState);
  const [processing, setProcessing] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    if (eventId) {
      loadEvent(eventId);
    }
    loadPrograms();
  }, [eventId]);

  // Populate the form once the event data has loaded
  useEffect(() => {
    if (!event) {
      return;
    }

    setForm({
      program: event.program?._id ?? '',
      eventType: event.eventType,
      name: event.name,
      description: event.description ?? '',
      additionalInfo: event.additionalInfo ?? '',
      startDate: event.startDate.slice(0, 10),
      endDate: event.endDate.slice(0, 10),
      location: event.location ?? '',
      rsvpDeadline: event.rsvpDeadline ? event.rsvpDeadline.slice(0, 10) : '',
      allowSignUps: event.allowSignUps,
      allowPartialAttendance: event.allowPartialAttendance,
      allocationRequired: event.allocationRequired,
    });
  }, [event]);

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
    if (!isValid || processing || !eventId) {
      return;
    }

    // Saving preserves whatever status the event is currently in; publishing (draft -> upcoming)
    // only happens from the event page.
    const eventUpdate: EventUpdate = {
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
    };

    setProcessing(true);

    updateEvent({
      eventId,
      eventUpdate,
      success: () => navigate(`/events/${eventId}`),
      failure: () => setProcessing(false),
    });
  };

  const handleDeleteConfirm = () => {
    setShowDeleteConfirm(false);

    if (!eventId) {
      return;
    }

    setProcessing(true);

    deleteEvent({
      eventId,
      success: () => navigate('/events'),
      failure: () => setProcessing(false),
    });
  };

  const chipProps = event ? statusChipProps[event.status] : statusChipProps.draft;
  const statusDescription = event ? statusDescriptions[event.status] : '';

  return (
    <PageLayout>
      <DialogAlert
        visible={showDeleteConfirm}
        title="Are you sure?"
        message="Deleting this event does not delete projects, but will automatically unassign volunteers. This cannot be undone."
        okLabel="Yes, Delete"
        handleClose={() => setShowDeleteConfirm(false)}
        handleCancel={() => setShowDeleteConfirm(false)}
        handleOk={handleDeleteConfirm}
      />

      <div className="viewContainer">
        <div className="gutters">
          <div className="mb-1">
            <Link to="/events" className="link">
              ← Back to events
            </Link>
          </div>

          <h1>
            edit
          </h1>

          <div className="contentCard">
            <EventFormFields form={form} programs={programs} onChange={handleChange} />

            <Grid container spacing={3} sx={{ marginTop: 0 }}>
              <Grid item xs={12}>
                <h3>
                  Current state
                </h3>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Chip size="small" variant="outlined" label={chipProps.label} color={chipProps.color} />
                  <span>{statusDescription}</span>
                </div>
              </Grid>

              <Grid item xs={12}>
                <Alert severity="error">
                  Deleting this event does not delete projects, but will automatically unassign volunteers.
                </Alert>
              </Grid>
            </Grid>

            <Grid container spacing={2} sx={{ marginTop: '0.5rem' }} alignItems="center" justifyContent="space-between">
              <Grid item xs={12} md={3}>
                <StandardButton theme="secondary" label="Cancel" handler={handleCancel} disabled={processing} />
              </Grid>
              <Grid item xs={12} md={3}>
                <StandardButton theme="warning" label="Delete Event" handler={() => setShowDeleteConfirm(true)} disabled={processing} />
              </Grid>
              <Grid item xs={12} md={3}>
                <StandardButton label="Save" handler={handleSave} disabled={!isValid || processing} />
              </Grid>
            </Grid>
          </div>
        </div>
      </div>
    </PageLayout>
  );
};

export default EditEvent;
