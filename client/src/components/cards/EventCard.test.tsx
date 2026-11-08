import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import EventCard from './EventCard';
import type { Event, EventAttendance } from '../../types/event';

// Times are in UTC; vitest.config.mts pins the test time zone to America/Detroit.
const buildEvent = (overrides: Partial<Event> = {}): Event => ({
  _id: 'event-1',
  program: {
    _id: 'program-1',
    name: 'Weekend for Good',
    description: '',
    imageUrl: '',
    events: [],
  },
  name: 'Spring Hack Night 2027',
  description: '',
  additionalInfo: '',
  startDate: '2027-03-12T22:00:00Z',
  endDate: '2027-03-13T03:00:00Z',
  location: '45 Example St SE, Grand Rapids, MI 49503',
  allowSignUps: true,
  allowPartialAttendance: false,
  allocationRequired: true,
  eventType: 'in-person',
  status: 'upcoming',
  ...overrides,
});

describe('EventCard date display', () => {
  it('shows the times and the month name for a single-day event', () => {
    render(<EventCard processing={false} event={buildEvent()} />);

    expect(
      screen.getByText('5:00 PM - 10:00 PM March 12, 2027'),
    ).toBeInTheDocument();
    expect(screen.queryByText(/undefined/)).not.toBeInTheDocument();
  });

  it('shows hours and minutes but not seconds', () => {
    const event = buildEvent({
      startDate: '2027-03-12T13:30:15Z',
      endDate: '2027-03-12T21:45:45Z',
    });
    render(<EventCard processing={false} event={event} />);

    expect(
      screen.getByText('8:30 AM - 4:45 PM March 12, 2027'),
    ).toBeInTheDocument();
  });

  it('shows a day range for a multi-day event within one month', () => {
    const event = buildEvent({
      startDate: '2026-11-06T22:00:00Z',
      endDate: '2026-11-08T22:00:00Z',
    });
    render(<EventCard processing={false} event={event} />);

    expect(screen.getByText('November 6 - 8, 2026')).toBeInTheDocument();
  });

  it('shows both months for an event that crosses a month boundary', () => {
    const event = buildEvent({
      startDate: '2026-10-30T22:00:00Z',
      endDate: '2026-11-02T22:00:00Z',
    });
    render(<EventCard processing={false} event={event} />);

    expect(
      screen.getByText('October 30 - November 2, 2026'),
    ).toBeInTheDocument();
  });

  it('shows both years for an event that crosses a year boundary', () => {
    const event = buildEvent({
      startDate: '2026-12-30T22:00:00Z',
      endDate: '2027-01-02T22:00:00Z',
    });
    render(<EventCard processing={false} event={event} />);

    expect(
      screen.getByText('December 30, 2026 - January 2, 2027'),
    ).toBeInTheDocument();
  });

  it('shows both months when the start and end share a day number', () => {
    const event = buildEvent({
      startDate: '2026-10-06T22:00:00Z',
      endDate: '2026-11-06T22:00:00Z',
    });
    render(<EventCard processing={false} event={event} />);

    expect(
      screen.getByText('October 6 - November 6, 2026'),
    ).toBeInTheDocument();
  });
});

const weekendEvent = buildEvent({
  name: 'Weekend for Good 2026',
  startDate: '2026-11-06T22:00:00Z',
  endDate: '2026-11-08T22:00:00Z',
  allowPartialAttendance: true,
  additionalInfo: 'Breakfast provided both days.',
});

const buildAttendance = (
  overrides: Partial<EventAttendance> = {},
): EventAttendance => ({
  _id: 'attendance-1',
  user: 'user-1',
  event: weekendEvent._id,
  attendance: 'attending',
  attendanceDetail: '',
  roles: [],
  allocation: 'unassigned',
  ...overrides,
});

describe('EventCard details', () => {
  it.each([
    ['in-person', 'In person'],
    ['online', 'Online'],
    ['hybrid', 'Hybrid'],
  ] as const)('labels %s events as "%s"', (eventType, label) => {
    render(<EventCard processing={false} event={buildEvent({ eventType })} />);

    expect(
      screen.getByText(`${label} @ 45 Example St SE, Grand Rapids, MI 49503`),
    ).toBeInTheDocument();
  });

  it('asks about volunteering when allocation is required, otherwise about attending', () => {
    const { rerender } = render(
      <EventCard processing={false} event={buildEvent()} />,
    );
    expect(
      screen.getByText(
        'Are you interested in volunteering for Spring Hack Night 2027?',
      ),
    ).toBeInTheDocument();

    rerender(
      <EventCard
        processing={false}
        event={buildEvent({ allocationRequired: false })}
      />,
    );
    expect(
      screen.getByText('Are you able to attend Spring Hack Night 2027?'),
    ).toBeInTheDocument();
  });

  it('offers partial attendance and counts the days for multi-day events', () => {
    render(<EventCard processing={false} event={weekendEvent} />);

    expect(screen.getByRole('button', { name: 'attending' })).toHaveTextContent(
      'Yes, all 3 days!',
    );
    expect(
      screen.getByRole('button', { name: 'partially attending' }),
    ).toBeInTheDocument();
  });

  it('tells volunteers when sign-ups are closed', () => {
    render(
      <EventCard
        processing={false}
        event={buildEvent({ allowSignUps: false })}
      />,
    );

    expect(
      screen.getByText('Thank you for your interest!'),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: 'attending' }),
    ).not.toBeInTheDocument();
  });
});

describe('EventCard RSVP', () => {
  it('only enables Save and Cancel once something changes', async () => {
    const user = userEvent.setup();
    render(<EventCard processing={false} event={weekendEvent} />);
    const save = screen.getByRole('button', { name: 'save' });
    expect(save).toBeDisabled();

    await user.click(screen.getByRole('button', { name: 'attending' }));

    expect(save).toBeEnabled();
    expect(screen.getByRole('button', { name: 'cancel' })).toBeEnabled();
  });

  it('saves the selected attendance for the event', async () => {
    const user = userEvent.setup();
    const handler = vi.fn();
    render(
      <EventCard processing={false} event={weekendEvent} handler={handler} />,
    );

    await user.click(screen.getByRole('button', { name: 'attending' }));
    await user.click(screen.getByRole('button', { name: 'save' }));

    expect(handler).toHaveBeenCalledWith('event-1', {
      attendance: 'attending',
      attendanceDetail: '',
      roles: [],
    });
  });

  it('saves the details of partial attendance', async () => {
    const user = userEvent.setup();
    const handler = vi.fn();
    render(
      <EventCard processing={false} event={weekendEvent} handler={handler} />,
    );

    await user.click(
      screen.getByRole('button', { name: 'partially attending' }),
    );
    await user.type(
      screen.getByLabelText('When can you attend?'),
      'Saturday only',
    );
    await user.click(screen.getByRole('button', { name: 'save' }));

    expect(handler).toHaveBeenCalledWith('event-1', {
      attendance: 'partial-attending',
      attendanceDetail: 'Saturday only',
      roles: [],
    });
  });

  it('drops partial-attendance details when switching to a full yes or no', async () => {
    const user = userEvent.setup();
    const handler = vi.fn();
    render(
      <EventCard
        processing={false}
        event={weekendEvent}
        attendance={buildAttendance({
          attendance: 'partial-attending',
          attendanceDetail: 'Saturday only',
        })}
        handler={handler}
      />,
    );

    await user.click(screen.getByRole('button', { name: 'not attending' }));
    await user.click(screen.getByRole('button', { name: 'save' }));

    expect(handler).toHaveBeenCalledWith('event-1', {
      attendance: 'not-attending',
      attendanceDetail: '',
      roles: [],
    });
  });

  it('restores the saved RSVP on cancel', async () => {
    const user = userEvent.setup();
    render(
      <EventCard
        processing={false}
        event={weekendEvent}
        attendance={buildAttendance()}
      />,
    );
    expect(screen.getByRole('button', { name: 'attending' })).toHaveAttribute(
      'aria-pressed',
      'true',
    );

    await user.click(screen.getByRole('button', { name: 'not attending' }));
    await user.click(screen.getByRole('button', { name: 'cancel' }));

    expect(screen.getByRole('button', { name: 'attending' })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
    expect(screen.getByRole('button', { name: 'save' })).toBeDisabled();
  });

  it('shows the event info after an RSVP is loaded', () => {
    const { rerender } = render(
      <EventCard processing={false} event={weekendEvent} />,
    );
    expect(
      screen.queryByText('Breakfast provided both days.'),
    ).not.toBeVisible();

    rerender(
      <EventCard
        processing={false}
        event={weekendEvent}
        attendance={buildAttendance()}
      />,
    );

    expect(screen.getByRole('button', { name: 'attending' })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
    expect(screen.getByText('Breakfast provided both days.')).toBeVisible();
  });

  it('disables saving while a save is in progress', async () => {
    const user = userEvent.setup();
    render(<EventCard processing event={weekendEvent} />);

    await user.click(screen.getByRole('button', { name: 'attending' }));

    expect(screen.getByRole('button', { name: 'save' })).toBeDisabled();
  });
});
