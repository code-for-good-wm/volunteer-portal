import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';

import EventCard from './EventCard';
import type { Event } from '../../types/event';

// Times are in UTC; vitest.config.mts pins the test time zone to America/Detroit.
const buildEvent = (overrides: Partial<Event> = {}): Event => ({
  _id: 'event-1',
  program: { _id: 'program-1', name: 'Weekend for Good', description: '', imageUrl: '', events: [] },
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

    expect(screen.getByText('5:00:00 PM - 10:00:00 PM March 12, 2027')).toBeInTheDocument();
    expect(screen.queryByText(/undefined/)).not.toBeInTheDocument();
  });

  it('shows a day range for a multi-day event within one month', () => {
    const event = buildEvent({ startDate: '2026-11-06T22:00:00Z', endDate: '2026-11-08T22:00:00Z' });
    render(<EventCard processing={false} event={event} />);

    expect(screen.getByText('November 6 - 8, 2026')).toBeInTheDocument();
  });

  it('shows both months for an event that crosses a month boundary', () => {
    const event = buildEvent({ startDate: '2026-10-30T22:00:00Z', endDate: '2026-11-02T22:00:00Z' });
    render(<EventCard processing={false} event={event} />);

    expect(screen.getByText('October 30 - November 2, 2026')).toBeInTheDocument();
  });

  it('shows both years for an event that crosses a year boundary', () => {
    const event = buildEvent({ startDate: '2026-12-30T22:00:00Z', endDate: '2027-01-02T22:00:00Z' });
    render(<EventCard processing={false} event={event} />);

    expect(screen.getByText('December 30, 2026 - January 2, 2027')).toBeInTheDocument();
  });
});
