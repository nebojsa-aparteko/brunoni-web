import React from 'react';
import { ReactNode, createContext, Dispatch, useEffect, useReducer } from 'react';
import {
  globalActions,
  GlobalAppState,
  START_GLOBAL_LOADING,
  STOP_GLOBAL_LOADING,
} from './types/globalAppState';
import globalReducer from './reducers/globalReducer';
import { useSnackbar } from 'notistack';
import { Typography } from '@material-ui/core';
import { tryGetErrorMessage } from '../utilities/errorHelper';

export const defaultState: GlobalAppState = {
  isGlobalLoadingInProgress: false,
};
export const GlobalContext = createContext<[GlobalAppState, Dispatch<globalActions>]>([
  defaultState,
  () => {},
]);

interface GlobalStoreProps {
  children: ReactNode;
}

const GlobalStore = ({ children }: GlobalStoreProps) => {
  const [state, dispatch] = useReducer(globalReducer, defaultState);
  const { snackbarMessage, promiseActivity } = state;
  const { enqueueSnackbar } = useSnackbar();

  useEffect(() => {
    if (snackbarMessage) {
      enqueueSnackbar(snackbarMessage.message, {
        variant: snackbarMessage.snackbarType,
        autoHideDuration: snackbarMessage.snackbarDuration || 1000,
        preventDuplicate: true,
      });
    }
  }, [snackbarMessage]);

  useEffect(() => {
    if (promiseActivity) {
      dispatch({ type: START_GLOBAL_LOADING });
      promiseActivity()
        .then(_ => {
          enqueueSnackbar(<Typography color="inherit">Saved changes!</Typography>, {
            variant: 'success',
            autoHideDuration: 1000,
          });
        })
        .catch(error => {
          console.error('error storing activity', error);
          enqueueSnackbar(<Typography color="inherit"> {tryGetErrorMessage(error)}!</Typography>, {
            variant: 'error',
            autoHideDuration: 3000,
          });
        })
        .finally(() => dispatch({ type: STOP_GLOBAL_LOADING }));
    }
  }, [promiseActivity, enqueueSnackbar, dispatch]);
  return <GlobalContext.Provider value={[state, dispatch]}>{children}</GlobalContext.Provider>;
};

export default GlobalStore;
