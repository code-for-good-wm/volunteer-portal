export interface Project {
  _id: string;
  event?: string; // ID of the event this project is assigned to, once accepted
}

export interface Position {
  _id: string;
  project: string;
}

export type SlotStatus = 'open' | 'invited' | 'confirmed' | 'confirmed-partial' | 'declined';

export interface Slot {
  _id: string;
  position: string;
  status: SlotStatus;
}
