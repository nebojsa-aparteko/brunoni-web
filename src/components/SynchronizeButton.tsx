import React, { useEffect, useState } from 'react';
import { useSnackbar } from 'notistack';
import { Box, CircularProgress, IconButton, makeStyles, Theme, Tooltip, Typography } from '@material-ui/core';
import RefreshIcon from '@material-ui/icons/Refresh';
import useUser from '../hooks/useUser';

interface Props {
  collection: 'quotes' | 'clientPerformance';
  alphacomClientId: string;
}

const useStyles = makeStyles((theme: Theme) => ({
  button: {
    position: 'relative',
  },
  progress: {
    position: 'absolute',
  },
}));

const SynchronizeButton: React.FC<Props> = ({ collection, alphacomClientId }) => {
  const classes = useStyles();

  const { enqueueSnackbar } = useSnackbar();

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
          `${process.env.REACT_APP_API_URL}/synchronization/${collection}/${alphacomClientId}`,
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
          enqueueSnackbar(<Typography color="inherit">Contents are now up to date.</Typography>, { variant: 'info' });
        } else {
          console.error(`Failed to request to refresh ${collection}`, response);
          enqueueSnackbar(
            <Typography color="inherit">Failed to refresh the contents. Please try again later.</Typography>,
            { variant: 'error' },
          );
        }
      } catch (e) {
        if (e.name !== 'AbortError') {
          enqueueSnackbar(
            <Typography color="inherit">Failed to refresh the contents. Please try again later.</Typography>,
            { variant: 'error' },
          );
          console.error('Failed to request the login email', e);
        }
      } finally {
        setBusy(false);
      }
    })();

    return () => {
      controller.abort();
    };
  }, [busy]);

  return (
    <Tooltip title="Refresh" enterDelay={500} leaveDelay={200}>
      <IconButton onClick={() => setBusy(true)} className={classes.button}>
        <CircularProgress size={15} className={classes.progress} style={{ visibility: busy ? 'visible' : 'hidden' }} />
        <RefreshIcon style={{ visibility: busy ? 'hidden' : 'visible' }} />
      </IconButton>
    </Tooltip>
  );
};

export default SynchronizeButton;
