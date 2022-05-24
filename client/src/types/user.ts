import { Profile } from './profile';

export interface User {
  id: string; // Pulled from Firebase Auth
  name: string;
  email: string;
  phone: string; // Ten numerical digits
  profile: Profile;
}
