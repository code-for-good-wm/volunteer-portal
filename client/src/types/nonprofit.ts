export type Is501c3Status = 'yes' | 'no' | 'in-progress';
export type NonprofitStatus = 'interested' | 'accepted' | 'archived';

export interface Nonprofit {
  _id: string;
  name: string;
  website?: string;
  description: string;
  city: string;
  state: string;
  is501c3: Is501c3Status;
  einNumber?: string;
  contactName: string;
  contactRole: string;
  contactEmail: string;
  contactPhone: string;
  status: NonprofitStatus;
  notes?: string;
  createdDate?: string; // ISO date; when this nonprofit record was added
}

export interface NonprofitCreate {
  name: string;
  website?: string;
  description: string;
  city: string;
  state: string;
  is501c3: Is501c3Status;
  einNumber?: string;
  contactName: string;
  contactRole: string;
  contactEmail: string;
  contactPhone?: string;
  notes?: string;
}

export interface NonprofitUpdate {
  name?: string;
  website?: string;
  description?: string;
  city?: string;
  state?: string;
  is501c3?: Is501c3Status;
  einNumber?: string;
  contactName?: string;
  contactRole?: string;
  contactEmail?: string;
  contactPhone?: string;
  status?: NonprofitStatus;
  notes?: string;
}
