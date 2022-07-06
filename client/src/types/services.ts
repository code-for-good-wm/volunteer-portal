import { ProfileUpdate, Role, UserSkill } from './profile';
import { UserUpdate } from './user';

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

export interface UpdateUserEmailParams extends ServiceParams {
  email: string,
  password: string,
}

export interface UpdateUserPasswordParams extends ServiceParams {
  password: string,
  newPassword: string,
}

export interface DeleteUserAccountParams extends ServiceParams {
  password: string,
}
export interface UpdateUserRolesParams extends ServiceParams {
  roles: Role[],
}

export interface UpdateGettingStartedProfileDataParams extends ServiceParams {
  userUpdate: UserUpdate,
  profileUpdate: ProfileUpdate
}

export interface UpdateUserSkillsParams extends ServiceParams {
  skills: UserSkill[]
}

export interface UpdateAdditionalSkillsParams extends ServiceParams {
  skills: UserSkill[]
  additionalSkills: string;
}
