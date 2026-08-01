import { ChangeEvent } from 'react';

import Checkbox from '@mui/material/Checkbox';
import FormControlLabel from '@mui/material/FormControlLabel';
import Grid from '@mui/material/Grid';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';

import { EventType, Program } from '../../../types/event';

export type EventFormState = {
  program: string,
  eventType: EventType | '',
  name: string,
  description: string,
  additionalInfo: string,
  startDate: string,
  endDate: string,
  location: string,
  rsvpDeadline: string,
  allowSignUps: boolean,
  allowPartialAttendance: boolean,
  allocationRequired: boolean,
};

export const initialEventFormState: EventFormState = {
  program: '',
  eventType: '',
  name: '',
  description: '',
  additionalInfo: '',
  startDate: '',
  endDate: '',
  location: '',
  rsvpDeadline: '',
  allowSignUps: true,
  allowPartialAttendance: false,
  allocationRequired: false,
};

export const isEventFormValid = (form: EventFormState) =>
  !!(form.program && form.eventType && form.name.trim() && form.startDate && form.endDate);

const eventTypeOptions: { id: EventType, label: string }[] = [
  { id: 'in-person', label: 'In-person' },
  { id: 'online', label: 'Online' },
  { id: 'hybrid', label: 'Hybrid' },
];

type EventFormFieldsProps = {
  form: EventFormState,
  programs: Program[],
  onChange: (field: keyof EventFormState, value: string | boolean) => void,
};

const EventFormFields = (props: EventFormFieldsProps) => {
  const { form, programs, onChange } = props;

  const handleField = (field: keyof EventFormState) => (event: ChangeEvent<HTMLInputElement>) => {
    onChange(field, event.target.value);
  };

  const handleCheckbox = (field: keyof EventFormState) => (event: ChangeEvent<HTMLInputElement>) => {
    onChange(field, event.target.checked);
  };

  return (
    <Grid container spacing={3}>
      <Grid item xs={12} md={6}>
        <TextField
          select
          fullWidth
          label="Program"
          value={form.program}
          onChange={handleField('program')}
          helperText="Events belong to a program — this is what groups the recurring ones together."
        >
          {programs.map((program) => (
            <MenuItem key={program._id} value={program._id}>
              {program.name}
            </MenuItem>
          ))}
        </TextField>
      </Grid>
      <Grid item xs={12} md={6}>
        <TextField
          select
          fullWidth
          label="Event type"
          value={form.eventType}
          onChange={handleField('eventType')}
          helperText="In-person, online or hybrid — the three values in code."
        >
          {eventTypeOptions.map((option) => (
            <MenuItem key={option.id} value={option.id}>
              {option.label}
            </MenuItem>
          ))}
        </TextField>
      </Grid>

      <Grid item xs={12}>
        <TextField
          fullWidth
          label="Event name"
          value={form.name}
          onChange={handleField('name')}
        />
      </Grid>

      <Grid item xs={12}>
        <TextField
          fullWidth
          multiline
          rows={3}
          label="Description"
          value={form.description}
          onChange={handleField('description')}
        />
      </Grid>

      <Grid item xs={12}>
        <TextField
          fullWidth
          multiline
          rows={2}
          label="Additional info"
          value={form.additionalInfo}
          onChange={handleField('additionalInfo')}
          helperText="Practical detail volunteers need on the day — shown under the event description."
        />
      </Grid>

      <Grid item xs={12} md={6}>
        <TextField
          fullWidth
          type="date"
          label="Start date"
          InputLabelProps={{ shrink: true }}
          value={form.startDate}
          onChange={handleField('startDate')}
        />
      </Grid>
      <Grid item xs={12} md={6}>
        <TextField
          fullWidth
          type="date"
          label="End date"
          InputLabelProps={{ shrink: true }}
          value={form.endDate}
          onChange={handleField('endDate')}
        />
      </Grid>

      <Grid item xs={12} md={6}>
        <TextField
          fullWidth
          label="Location"
          value={form.location}
          onChange={handleField('location')}
        />
      </Grid>
      <Grid item xs={12} md={6}>
        <TextField
          fullWidth
          type="date"
          label="RSVP deadline"
          InputLabelProps={{ shrink: true }}
          value={form.rsvpDeadline}
          onChange={handleField('rsvpDeadline')}
        />
      </Grid>

      <Grid item xs={12}>
        <h3>
          Sign-up behavior
        </h3>

        <FormControlLabel
          sx={{ display: 'flex', alignItems: 'flex-start', marginBottom: 1 }}
          control={<Checkbox checked={form.allowSignUps} onChange={handleCheckbox('allowSignUps')} sx={{ paddingTop: 0 }} />}
          label={
            <div>
              <div>Allow sign-ups</div>
              <div style={{ fontSize: '0.8rem', color: 'rgba(0, 0, 0, 0.6)' }}>Volunteers can RSVP to this event.</div>
            </div>
          }
        />
        <FormControlLabel
          sx={{ display: 'flex', alignItems: 'flex-start', marginBottom: 1 }}
          control={<Checkbox checked={form.allowPartialAttendance} onChange={handleCheckbox('allowPartialAttendance')} sx={{ paddingTop: 0 }} />}
          label={
            <div>
              <div>Allow partial attendance</div>
              <div style={{ fontSize: '0.8rem', color: 'rgba(0, 0, 0, 0.6)' }}>Volunteers can say they&apos;ll come for some of it, and tell us which days.</div>
            </div>
          }
        />
        <FormControlLabel
          sx={{ display: 'flex', alignItems: 'flex-start', marginBottom: 1 }}
          control={<Checkbox checked={form.allocationRequired} onChange={handleCheckbox('allocationRequired')} sx={{ paddingTop: 0 }} />}
          label={
            <div>
              <div>Allocation required</div>
              <div style={{ fontSize: '0.8rem', color: 'rgba(0, 0, 0, 0.6)' }}>Volunteers are selected onto project teams rather than simply turning up. This is the switch that brings positions and matching into play.</div>
            </div>
          }
        />
      </Grid>
    </Grid>
  );
};

export default EventFormFields;
