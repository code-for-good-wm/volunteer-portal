export type ProjectStatus = "interested" | "accepted" | "rejected" | "archived";
export type OnsiteContactAvailability = "in-person" | "remote" | "none";
export type BrandAssetsStatus = "yes" | "partial" | "no";

export interface Project {
  _id: string;
  nonprofit: string;
  event?: string;
  name: string;
  description: string;
  problem: string;
  successCriteria: string;
  whoUsesIt: string;
  existingSystem: string;
  timeline: string;
  status: ProjectStatus;
  onsiteContactAvailability: OnsiteContactAvailability;
  onsiteContactName?: string;
  brandAssets: BrandAssetsStatus;
  notes?: string;
  reference?: string;
  submittedAt?: string; // ISO date
}

export interface Position {
  _id: string;
  project: string;
}

export type SlotStatus =
  | "open"
  | "invited"
  | "confirmed"
  | "confirmed-partial"
  | "declined";

export interface Slot {
  _id: string;
  position: string;
  status: SlotStatus;
}
