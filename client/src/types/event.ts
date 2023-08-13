import { Role } from './profile';

export type EventType = 'in-person' | 'online' | 'hybrid';

export type Status = 'draft' | 'upcoming' | 'active' | 'complete' | 'cancelled';

export type Attendance  = 'attending' | 'partial-attending' | 'not-attending';

export type Allocation = 'unassigned' | 'assigned' | 'backup' | 'general' | 'float';

export interface Event {
  _id: string; // ID of program document in database
  program: Program,
  name: string,
  description: string,
  startDate: string, // ISO date with time zone
  endDate: string, // ISO date with time zone
  location: string, // full address of event
  allowSignUps: boolean,
  allowPartialAttendance: boolean,
  eventType: EventType,
  status: Status
}

export interface EventUpdate {
  name?: string,
  description?: string,
  startDate?: string, // ISO date with time zone
  endDate?: string, // ISO date with time zone
  location?: string, // full address of event
  allowSignUps?: boolean,
  allowPartialAttendance?: boolean,
  eventType?: EventType,
  status?: Status
}

export interface Program {
  _id: string; // ID of program document in database
  name: string;
  description: string;
  imageUrl: string;
  events: Event[];
}

export interface ProgramUpdate {
  name?: string;
  description?: string;
  imageUrl?: string;
}

export interface EventAttendance {
  _id: string,
  user: string,
  event: string,
  attendance: Attendance,
  attendanceDetail: string,
  roles: Role[];
  allocation: Allocation
}

export interface EventAttendanceUpdate {
  attendance: Attendance | null,
  attendanceDetail: string | null,
  roles?: Role[];
  allocation?: Allocation
}