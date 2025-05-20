import React, { useContext, useEffect, useState } from 'react';
import { CircularProgress, IconButton, makeStyles, Tooltip } from '@material-ui/core';
import RefreshIcon from '@material-ui/icons/Refresh';
import useUser from '../hooks/useUser';
import { GlobalContext } from '../store/GlobalStore';
import { SHOW_ERROR_SNACKBAR, SHOW_INFO_SNACKBAR } from '../store/types/globalAppState';

interface Props {
  collection: 'quotes' | 'clientPerformance';
  alphacomClientId: string;
}

const useStyles = makeStyles(() => ({
  button: {
    position: 'relative',
  },
  progress: {
    position: 'absolute',
  },
}));

const SynchronizeButton: React.FC<Props> = ({ collection, alphacomClientId }) => {
  const classes = useStyles();

  const [, dispatch] = useContext(GlobalContext);

  const [busy, setBusy] = useState(false);

  const [user] = useUser();

  useEffect(() => {
    if (!busy) {
      return undefined;
    }

    const controller = new AbortController();
    const signal = controller.signal;

    (async () => {
      try {
        const token = await user.getIdToken();

        const response = await fetch(
          `${import.meta.env.VITE_REACT_APP_API_URL}/synchronization/${collection}/${alphacomClientId}`,
          {
            method: 'POST',
            mode: 'cors',
            cache: 'no-cache',
            credentials: 'include',
            headers: {
              Accept: 'application/json',
              Authorization: `Bearer ${token}`,
            },
            signal,
          },
        );

        if (response.ok) {
          dispatch({ type: SHOW_INFO_SNACKBAR, message: 'Contents are now up to date.' });
        } else {
          console.error(`Failed to request to refresh ${collection}`, response);
          dispatch({
            type: SHOW_ERROR_SNACKBAR,
            message: 'Failed to refresh the contents. Please try again later.',
          });
        }
      } catch (e) {
        if (e instanceof Error && e.name !== 'AbortError') {
          dispatch({
            type: SHOW_ERROR_SNACKBAR,
            message: 'Failed to refresh the contents. Please try again later',
          });
          console.error('Failed to request the login email', e);
        }
      } finally {
        setBusy(false);
      }
    })();

    return () => {
      controller.abort();
    };
  }, [busy, alphacomClientId, collection, user, dispatch]);

  return (
    <Tooltip title="Refresh" enterDelay={500} leaveDelay={200}>
      <IconButton onClick={() => setBusy(true)} className={classes.button}>
        <CircularProgress
          size={15}
          className={classes.progress}
          style={{ visibility: busy ? 'visible' : 'hidden' }}
        />
        <RefreshIcon style={{ visibility: busy ? 'hidden' : 'visible' }} />
      </IconButton>
    </Tooltip>
  );
};

export default SynchronizeButton;
