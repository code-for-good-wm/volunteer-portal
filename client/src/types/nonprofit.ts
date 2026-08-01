export type Is501c3Status = 'yes' | 'no' | 'in-progress';

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
}
