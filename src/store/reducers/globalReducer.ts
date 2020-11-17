import { Reducer } from 'react';
import {
  globalActions,
  GlobalAppState,
  SHOW_ERROR_SNACKBAR,
  SHOW_INFO_SNACKBAR,
  SHOW_SUCCESS_SNACKBAR,
  START_GLOBAL_LOADING,
  STOP_GLOBAL_LOADING,
} from '../types/globalAppState';
import { defaultState } from '../GlobalStore';

const globalReducer: Reducer<GlobalAppState, globalActions> = (prevState = defaultState, action) => {
  switch (action.type) {
    case START_GLOBAL_LOADING:
      return { ...prevState, isGlobalLoadingInProgress: true };
    case STOP_GLOBAL_LOADING:
      return { ...prevState, isGlobalLoadingInProgress: false };
    case SHOW_SUCCESS_SNACKBAR:
      return { ...prevState, snackbarMessage: action.message, snackbarType: 'success' };
    case SHOW_ERROR_SNACKBAR:
      return { ...prevState, snackbarMessage: action.message, snackbarType: 'error' };
    case SHOW_INFO_SNACKBAR:
      return { ...prevState, snackbarMessage: action.message, snackbarType: 'info' };
    default:
      return prevState;
  }
};

export default globalReducer;
