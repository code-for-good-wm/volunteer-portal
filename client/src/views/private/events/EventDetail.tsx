import { ReactNode, useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';

import Chip from '@mui/material/Chip';
import Grid from '@mui/material/Grid';

import { useAppDispatch, useAppSelector } from '../../../store/hooks';
import { selectEventById } from '../../../store/eventsSlice';
import { selectAttendancesByEvent } from '../../../store/eventAttendanceSlice';
import { updateAlert } from '../../../store/alertSlice';
import { loadEvent, loadAttendance, updateEvent } from '../../../services/event';
import { EventSlotCounts, getEventSlotCounts } from '../../../services/project';
import PageLayout from '../../../layouts/PageLayout';
import StandardButton from '../../../components/buttons/StandardButton';
import { statusChipProps, statusDescriptions } from '../../../helpers/eventStatus';

// Dates are stored as UTC midnight (from date-only form inputs) — format in UTC so the
// displayed calendar day always matches what was entered, regardless of browser timezone.
const dateFormatter = new Intl.DateTimeFormat('en-US', { month: 'long', day: 'numeric', year: 'numeric', timeZone: 'UTC' });

const formatDate = (date?: string) => date ? dateFormatter.format(new Date(date)) : '—';

type FieldDisplayProps = {
  label: string,
  value: ReactNode,
};

const FieldDisplay = (props: FieldDisplayProps) => {
  const { label, value } = props;
  return (
    <div style={{ marginBottom: '1.5rem' }}>
      <div style={{ fontWeight: 700, marginBottom: 4 }}>{label}</div>
      <div>{value || '—'}</div>
    </div>
  );
};

const EventDetail = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { eventId } = useParams<{ eventId: string }>();

  const event = useAppSelector((state) => eventId ? selectEventById(state, eventId) : undefined);
  const attendanceData = useAppSelector((state) => eventId ? selectAttendancesByEvent(state, eventId) : []);

  const [slotCounts, setSlotCounts] = useState<EventSlotCounts>({ confirmed: 0, declined: 0 });
  const [publishing, setPublishing] = useState(false);

  useEffect(() => {
    if (eventId) {
      loadEvent(eventId);
      getEventSlotCounts(eventId).then(setSlotCounts);
    }
    loadAttendance();
  }, [eventId]);

  // "Attending" is anyone who signed up to volunteer for the event at all (whether full
  // or partial); "Confirmed"/"Declined" are project-level outcomes tracked separately via
  // Slot status, once a volunteer has been selected onto a project and responded.
  const attendingCount = useMemo(
    () => attendanceData.filter(a => a.attendance !== 'not-attending').length,
    [attendanceData]
  );

  const chipProps = event ? statusChipProps[event.status] : statusChipProps.draft;
  const statusDescription = event ? statusDescriptions[event.status] : '';

  const handlePublish = () => {
    if (!eventId || publishing) {
      return;
    }

    setPublishing(true);

    updateEvent({
      eventId,
      eventUpdate: { status: 'upcoming' },
      success: () => {
        setPublishing(false);
        dispatch(updateAlert({
          visible: true,
          theme: 'success',
          content: 'Event published — it\'s now visible to volunteers.',
        }));
      },
      failure: () => setPublishing(false),
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
            Event: {event?.name}
          </h1>

          <div className="contentCard">
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginBottom: '1.5rem' }}>
              <div style={{ minWidth: 160 }}>
                <StandardButton
                  theme={event?.status === 'draft' ? 'secondary' : 'primary'}
                  label="Edit Event"
                  handler={() => eventId && navigate(`/events/${eventId}/edit`)}
                />
              </div>
              { event?.status === 'draft' && (
                <div style={{ minWidth: 160 }}>
                  <StandardButton
                    label="Publish"
                    handler={handlePublish}
                    disabled={publishing}
                  />
                </div>
              )}
            </div>

            <FieldDisplay label="Event name" value={event?.name} />
            <FieldDisplay label="Description" value={event?.description} />
            <FieldDisplay label="Additional info" value={event?.additionalInfo} />

            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <FieldDisplay label="Start date" value={formatDate(event?.startDate)} />
              </Grid>
              <Grid item xs={12} md={6}>
                <FieldDisplay label="End date" value={formatDate(event?.endDate)} />
              </Grid>
              <Grid item xs={12} md={6}>
                <FieldDisplay label="Location" value={event?.location} />
              </Grid>
              <Grid item xs={12} md={6}>
                <FieldDisplay label="RSVP deadline" value={formatDate(event?.rsvpDeadline)} />
              </Grid>
            </Grid>

            <h3>
              Current state
            </h3>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
              <Chip size="small" variant="outlined" label={chipProps.label} color={chipProps.color} />
              <span>{statusDescription}</span>
            </div>

            <h3>
              Event RSVPs
            </h3>
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              <Chip variant="outlined" color="primary" label={`${attendingCount} Attending`} />
              <Chip variant="outlined" color="success" label={`${slotCounts.confirmed} Confirmed`} />
              <Chip variant="outlined" color="warning" label={`${slotCounts.declined} Declined`} />
            </div>
          </div>
        </div>
      </div>
    </PageLayout>
  );
};

export default EventDetail;
