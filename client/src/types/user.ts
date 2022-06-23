import { Profile } from './profile';

export interface User {
  _id: string; // ID of user document in database
  name: string;
  email: string;
  phone: string; // Ten numerical digits
  profile: Profile
}
