import { useState, ChangeEvent, useMemo, MouseEvent as mEvent } from 'react';
import { styled } from '@mui/material/styles';
import Box from '@mui/material/Box';
import Collapse from '@mui/material/Collapse';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';

import StandardButton from '../buttons/StandardButton';
import { Event, EventAttendance, EventAttendanceUpdate } from '../../types/event';
import type { Attendance } from '../../types/event';

type EventCardProps = {
  processing: boolean,
  event?: Event,
  attendance?: EventAttendance,
  handler?: (eventId: string, attendanceUpdate: EventAttendanceUpdate) => void,
};

const StyledToggleButtonGroup = styled(ToggleButtonGroup)(({ theme }) => {
  const border = '1px solid rgba(0, 0, 0, 0.12)';
  const borderHover = '1px solid ' + theme.palette.primary.main;
  return {
    '& .MuiToggleButtonGroup-grouped': {
      margin: theme.spacing(1),
      fontWeight: 'bold',
      transition: 'all 300ms',
      '&:not(:first-of-type)': {
        border,
        borderRadius: theme.shape.borderRadius,
        '&:hover': {
          backgroundColor: theme.palette.primary.contrastText,
          border: borderHover,
        },
      },
      '&:first-of-type': {
        border,
        borderRadius: theme.shape.borderRadius,
        '&:hover': {
          backgroundColor: theme.palette.primary.contrastText,
          border: borderHover,
        },
      },
      '&.Mui-selected': {
        backgroundColor: theme.palette.primary.main,
        color: theme.palette.primary.contrastText,
        '&:hover': {
          backgroundColor: theme.palette.primary.dark,
          border: borderHover,
        },
      },
    },
  };
});

const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

const getEventDateTime = (event: Event | undefined) => {
  if (!event) { return ''; }

  const startDate = new Date(event.startDate);
  const endDate = new Date(event.endDate);

  const sameDay = startDate.getDate() === endDate.getDate();
  const sameMonth = startDate.getMonth() === endDate.getMonth();
  const sameYear = startDate.getFullYear() === endDate.getFullYear();

  // same day, include time
  if (sameDay && sameMonth && sameYear) {
    const timeSpan = `${startDate.toLocaleTimeString()} - ${endDate.toLocaleTimeString()}`;
    return `${timeSpan} ${months[startDate.getDate()]} ${startDate.getDate()}, ${startDate.getFullYear()}`;
  }

  const startMonth = startDate.getMonth();
  const endMonth = endDate.getMonth();

  // multiple days within a month
  if (!sameDay && sameMonth && sameYear) {
    return `${months[startMonth]} ${startDate.getDate()} - ${endDate.getDate()}, ${startDate.getFullYear()}`;
  }

  // crosses a month boundary
  if (!sameDay && !sameMonth && sameYear) {
    return `${months[startMonth]} ${startDate.getDate()} - ${months[endMonth]} ${endDate.getDate()}, ${startDate.getFullYear()}`;
  }

  // crosses a month and year boundary
  return `${months[startMonth]} ${startDate.getDate()}, ${startDate.getFullYear()} - ${months[endMonth]} ${endDate.getDate()}, ${endDate.getFullYear()}`;
};

const getEventDuration = (event: Event | undefined) => {
  if (!event || !event.allowPartialAttendance) { return 'I\'ll be there'; }

  const startDate = new Date(event.startDate);
  const endDate = new Date(event.endDate);

  // difference in milliseconds
  const diff = endDate.getTime() - startDate.getTime();
  const msPerHour = 60 * 60 * 1000;
  
  // less than 12 hours
  if (diff < (12 * msPerHour)) {
    return 'I\'ll be there';
  }

  // add one day to account for difference not counting the current day
  const days = Math.round(diff / (24 * msPerHour)) + 1;

  // multiple days
  return `all ${days} days`;
};



const EventCard = (props: EventCardProps) => {
  const { processing, event, attendance, handler } = props;

  const [hasChanges, setHasChanges] = useState(false);
  const [attendanceValue, setAttendanceValue] = useState<Attendance | null>(attendance?.attendance ?? null);
  const [attendanceDetailValue, setAttendanceDetailValue] = useState<string>(attendance?.attendanceDetail ?? '');

  const [showAttendanceDetail, setShowAttendanceDetail] = useState(attendance?.attendance === 'partial-attending');

  const eventDateAndTime = getEventDateTime(event);
  const eventDuration = getEventDuration(event);
  const eventType = event?.eventType === 'in-person' ? 'In person' : 'Online';
  
  const handleCard = handler ? handler : () => console.log('Attendance saved.');

  /* Memo */
  useMemo(() => {
    if (attendance) {
      setAttendanceValue(attendance.attendance ?? null);
      setAttendanceDetailValue(attendance.attendanceDetail ?? null);
      setShowAttendanceDetail(attendance.attendance === 'partial-attending');
    }
  }, [attendance]);

  /* Handlers */
  const handleAttendance = (_event: mEvent<HTMLElement>, newAttendance: Attendance | null) => {
    const value = newAttendance as Attendance;

    setAttendanceValue(value);
    setShowAttendanceDetail(value === 'partial-attending');

    // allow saving
    setHasChanges(true);
  };

  const handleAttendanceDetail = (event: ChangeEvent<HTMLInputElement>) => {
    const { target: { value } } = event;
    setAttendanceDetailValue(value);
    setHasChanges(true);
  };

  const handleSave = () => {
    if (event === undefined) {
      console.error('Event must be known before attendance can be saved.');
      setHasChanges(false);
      return;
    }
    handleCard(event?._id, {
      attendance: attendanceValue,
      attendanceDetail: attendanceDetailValue,
      roles: [] // not supporting role selection currently - use the profile
    });
    setHasChanges(false);
  };

  const handleCancel = () => {
    setAttendanceValue(attendance?.attendance ?? null);
    setAttendanceDetailValue(attendance?.attendanceDetail ?? '');
    setHasChanges(false);
  };

  return (
    <div className="contentCard dashboardCard">

      { event?.allowSignUps && // signups are currently allowed
      <Box>
        <p style={{ fontWeight: 'bold' }}>Are you able to attend { event?.name }?</p>
        <p style={{ fontSize: 'larger' }}>{ eventDateAndTime }</p>
        { event?.location && <p className="eventLocation">{ eventType } @ { event?.location }</p> }

        <form className="eventAttendanceForm">
          <StyledToggleButtonGroup
            value={attendanceValue}
            exclusive
            color="primary"
            onChange={handleAttendance}
            aria-label="attendance selection">
            <ToggleButton value="attending" aria-label="attending">Yes, { eventDuration }!</ToggleButton>
            { event?.allowPartialAttendance &&
            <ToggleButton value="partial-attending" aria-label="partially attending">Yes, some of the time</ToggleButton> }
            <ToggleButton value="not-attending" aria-label="not attending">No, sadly declining</ToggleButton>
          </StyledToggleButtonGroup>

          { event?.allowPartialAttendance &&
          <Collapse in={showAttendanceDetail} sx={{ width: '88%', margin: '0 auto' }}>
            <TextField
              variant="outlined"
              fullWidth
              id="attendanceDetail"
              name="attendanceDetail"
              type="text"
              label="When can you attend?"
              InputLabelProps={{ shrink: true }}
              aria-label="details about partially attending"
              value={attendanceDetailValue}
              onChange={handleAttendanceDetail} />
          </Collapse> }

          <div className="dashboardCardButtonContainer">
            <Stack spacing={2} direction="row">
              <StandardButton aria-label="cancel"
                label="Cancel"
                theme="secondary"
                disabled={processing || !hasChanges}
                handler={handleCancel} />
              <StandardButton aria-label="save"
                label="Save"
                disabled={processing || !hasChanges}
                handler={handleSave} />
            </Stack>
          </div>
        </form> 
      </Box> }

      { !event?.allowSignUps && // signups are closed
      <Box>
        <p style={{ fontWeight: 'bold' }}>{ event?.name }</p>
        <p style={{ fontSize: 'larger' }}>{ eventDateAndTime }</p>
        { event?.location && <p className="eventLocation">{ eventType } @ { event?.location }</p> }
        <p style={{ marginTop: '1em', fontSize: 'smaller' }}>Thank you for your interest!<br />Unfortunately sign-ups are closed.</p>
      </Box> }
    </div>
  );
};

export default EventCard;