import React, { useEffect, useState } from 'react';
import { Theme, makeStyles, Box, Typography } from '@material-ui/core';
import useUser from '../hooks/useUser';

interface Props {}

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    fontWeight: 'bold',
  },
}));

const useEndpoint = (uri: string) => {
  const user = useUser();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | undefined>();
  const [data, setData] = useState<string[] | undefined>();
  const [request, setRequest] = useState(0);

  useEffect(() => {
    if (!user) {
      return;
    }

    const controller = new AbortController();
    const signal = controller.signal;

    (async () => {
      try {
        const token = await user.getIdToken();

        const response = await fetch(`${process.env.REACT_APP_API_URL}${uri}`, {
          method: 'GET',
          mode: 'cors',
          cache: 'no-cache',
          credentials: 'include',
          headers: {
            Accept: 'application/json',
            Authorization: `Bearer ${token}`,
          },
          signal,
        });

        if (response.ok) {
          const body = await response.json();
          setData(body);
        } else {
          const body = await response.json();
          setError(body.error);
          console.error(`Failed to request ${uri}`, response, body);
        }
      } catch (e) {
        setError('Something went wrong. Please try again later.');
        console.error('Failed to request the login email', e);
      } finally {
        setBusy(false);
      }
    })();

    return () => {
      controller.abort();
    };
  }, [user, uri, request]);

  const refresh = () => setRequest(request + 1);

  return [busy, error, data, refresh];
};

const Quotes: React.FC<Props> = ({}) => {
  const classes = useStyles();
  const [busy, error, data, refresh] = useEndpoint('/quotes');

  return (
    <Box>
      <Box>
        <Typography variant="h6">Busy</Typography>
        <Typography variant="caption">{JSON.stringify(busy)}</Typography>
      </Box>
      <Box>
        <Typography variant="h6">Error</Typography>
        <Typography variant="caption">{JSON.stringify(error)}</Typography>
      </Box>
      <Box>
        <Typography variant="h6">Data</Typography>
        <Typography variant="caption">{JSON.stringify(data)}</Typography>
      </Box>
      <Box>
        <Typography variant="h6">Refresh</Typography>
        <Typography variant="caption">{JSON.stringify(refresh)}</Typography>
      </Box>
    </Box>
  );
};

export default Quotes;
