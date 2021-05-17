export const START_GLOBAL_LOADING = 'START_GLOBAL_LOADING';
export const STOP_GLOBAL_LOADING = 'STOP_GLOBAL_LOADING';
export const SHOW_SUCCESS_SNACKBAR = 'SHOW_SUCCESS_SNACKBAR';
export const SHOW_ERROR_SNACKBAR = 'SHOW_ERROR_SNACKBAR';
export const SHOW_INFO_SNACKBAR = 'SHOW_INFO_SNACKBAR';
export const SAVED_ACTION_SNACKBAR = 'SAVED_ACTION_SNACKBAR';

export interface StartGlobalLoadingAction {
  type: typeof START_GLOBAL_LOADING;
}

export interface StopGlobalLoadingAction {
  type: typeof STOP_GLOBAL_LOADING;
}
export interface ShowSuccessSnackbarAction {
  type: typeof SHOW_SUCCESS_SNACKBAR;
  message: string;
  duration?: number;
}
export interface ShowErrorSnackbarAction {
  type: typeof SHOW_ERROR_SNACKBAR;
  message: string;
  duration?: number;
}
export interface ShowInfoSnackbarAction {
  type: typeof SHOW_INFO_SNACKBAR;
  message: string;
  duration?: number;
}
export interface PromiseAction {
  type: typeof SAVED_ACTION_SNACKBAR;
  storeToFirebase?: () => Promise<any>;
}

export interface GlobalAppState {
  isGlobalLoadingInProgress: boolean;
  snackbarMessage?: string;
  snackbarDuration?: number;
  snackbarType?: 'error' | 'success' | 'info';
  promiseActivity?: () => Promise<any>;
}

export type globalActions =
  | StartGlobalLoadingAction
  | StopGlobalLoadingAction
  | ShowErrorSnackbarAction
  | ShowSuccessSnackbarAction
  | PromiseAction
  | ShowInfoSnackbarAction;
