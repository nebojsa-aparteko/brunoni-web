import React, { createContext, Dispatch, useEffect, useReducer } from 'react';
import { globalActions, GlobalAppState } from './types/globalAppState';
import globalReducer from './reducers/globalReducer';
import { useSnackbar } from 'notistack';

export const defaultState: GlobalAppState = {
  isGlobalLoadingInProgress: false,
};
export const GlobalContext = createContext<[GlobalAppState, Dispatch<globalActions>]>([defaultState, () => {}]);

const GlobalStore: React.FC = ({ children }) => {
  const [state, dispatch] = useReducer(globalReducer, defaultState);
  const { snackbarMessage, snackbarType } = state;
  const { enqueueSnackbar } = useSnackbar();

  useEffect(() => {
    if (snackbarMessage && snackbarType) {
      enqueueSnackbar(snackbarMessage, {
        variant: snackbarType,
        autoHideDuration: 1000,
      });
    }
  }, [snackbarMessage, snackbarType]);

  return <GlobalContext.Provider value={[state, dispatch]}>{children}</GlobalContext.Provider>;
};

export default GlobalStore;
