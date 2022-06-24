import { Role } from './profile';

export interface ServiceParams {
  success?: () => void,
  failure?: (message: string) => void,
}

export interface SignInParams extends ServiceParams {
  email: string,
  password: string,
}

export interface RecoverPasswordParams extends ServiceParams {
  email: string,
}

export interface UpdateUserRolesParams extends ServiceParams {
  roles: Role[],
}
