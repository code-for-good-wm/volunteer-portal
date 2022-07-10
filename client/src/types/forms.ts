export interface FormAlertState {
  show: boolean,
  text: string,
  severity?: 'error' | 'warning' | 'info' | 'success'
}
