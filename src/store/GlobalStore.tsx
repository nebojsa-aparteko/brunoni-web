import React, { createContext, Dispatch, useEffect, useReducer } from 'react';
import { globalActions, GlobalAppState, START_GLOBAL_LOADING, STOP_GLOBAL_LOADING } from './types/globalAppState';
import globalReducer from './reducers/globalReducer';
import { useSnackbar } from 'notistack';
import { Typography } from '@material-ui/core';

export const defaultState: GlobalAppState = {
  isGlobalLoadingInProgress: false,
};
export const GlobalContext = createContext<[GlobalAppState, Dispatch<globalActions>]>([defaultState, () => {}]);

const GlobalStore: React.FC = ({ children }) => {
  const [state, dispatch] = useReducer(globalReducer, defaultState);
  const { snackbarMessage, snackbarType, promiseActivity, snackbarDuration } = state;
  const { enqueueSnackbar } = useSnackbar();

  useEffect(() => {
    if (snackbarMessage && snackbarType) {
      enqueueSnackbar(snackbarMessage, {
        variant: snackbarType,
        autoHideDuration: snackbarDuration || 1000,
      });
    }
  }, [snackbarMessage, snackbarType, enqueueSnackbar]);

  useEffect(() => {
    if (promiseActivity) {
      dispatch({ type: START_GLOBAL_LOADING });
      console.log('Test');
      promiseActivity()
        .then(_ => {
          enqueueSnackbar(<Typography color="inherit">Saved changes!</Typography>, {
            variant: 'success',
            autoHideDuration: 1000,
          });
        })
        .catch(error => {
          console.error('error storing activity', error);
          enqueueSnackbar(<Typography color="inherit"> {error.message}!</Typography>, {
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
