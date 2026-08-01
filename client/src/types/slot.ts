export type SlotStatus =
  'open' | 'invited' | 'confirmed' | 'confirmed-partial' | 'declined';

export interface Slot {
  _id: string;
  position: string;
  user?: string;
  status: SlotStatus;
  invitedAt?: string;
  respondedAt?: string;
  partialDetail?: string;
  declineReason?: string;
}
