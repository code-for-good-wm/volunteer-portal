export type UserRole = 'volunteer' | 'nonprofit' | 'boardmember' | 'admin';

export interface User {
  _id: string; // ID of user document in database
  firstName: string;
  lastName: string;
  email: string;
  phone: string; // Ten numerical digits
  userRole: UserRole;
}

export interface UserUpdate {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
}
