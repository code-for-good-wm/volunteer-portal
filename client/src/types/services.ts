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
