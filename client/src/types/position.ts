import { Role } from './profile';

export interface Position {
  _id: string;
  project: string;
  role: Role;
  slotCount: number;
  notes?: string;
}
