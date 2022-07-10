export interface User {
  _id: string; // ID of user document in database
  name: string;
  email: string;
  phone: string; // Ten numerical digits
}

export interface UserUpdate {
  name?: string;
  email?: string;
  phone?: string;
}
