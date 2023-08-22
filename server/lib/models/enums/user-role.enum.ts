export enum UserRole {
  VOLUNTEER = 'volunteer', // read/edit/delete their own user record
  NONPROFIT = 'nonprofit', // sign up as a nonprofit and enter project details
  BOARDMEMBER = 'boardmember', // read/edit any user record
  ADMIN = 'admin' // assign permissions, delete users
}

export const READ_USER = [ UserRole.VOLUNTEER, UserRole.NONPROFIT, UserRole.BOARDMEMBER, UserRole.ADMIN ];
export const READ_ALL_USERS = [ UserRole.BOARDMEMBER, UserRole.ADMIN ];
export const EDIT_ALL_USERS = [ UserRole.BOARDMEMBER, UserRole.ADMIN ];

export const READ_ALL_EVENTS = [ UserRole.BOARDMEMBER, UserRole.ADMIN ];
export const EDIT_ALL_EVENTS = [ UserRole.BOARDMEMBER, UserRole.ADMIN ];