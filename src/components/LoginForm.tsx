import React, { ChangeEvent, FormEvent, useEffect, useRef, useState } from 'react';
import { makeStyles, Theme } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import { CircularProgress, TextField } from '@material-ui/core';

const useStyles = makeStyles((theme: Theme) => ({
  button: {
    position: 'relative',
    marginTop: theme.spacing(1),
    marginRight: theme.spacing(1),
  },
  progress: {
    position: 'absolute',
  },
}));

interface Props {
  onComplete: () => void;
}

const LoginForm: React.FC<Props> = ({ onComplete }) => {
  const classes = useStyles();
  const inputRef = useRef<HTMLInputElement>();
  const [emailAddress, setEmailAddress] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!busy) {
      return undefined;
    }

    const controller = new AbortController();
    const signal = controller.signal;

    (async () => {
      try {
        const response = await fetch(`${process.env.REACT_APP_API_URL}/session/request`, {
          method: 'POST',
          mode: 'cors',
          cache: 'no-cache',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
          },
          body: JSON.stringify({
            emailAddress,
          }),
          signal,
        });

        if (response.ok) {
          onComplete();
        } else {
          const body = await response.json();
          setError(body.error);
          console.error('Failed to request the login email', response, body);
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [emailAddress, busy]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (busy) {
      return;
    }

    const looksLikeEmailAddress = emailAddress.match(
      /.+@(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z0-9][a-z0-9-]{0,61}[a-z0-9]$/,
    );

    if (!looksLikeEmailAddress) {
      inputRef.current!.focus();
      return;
    }

    setBusy(true);

    // setTimeout(() => {
    //   onComplete();
    //   setBusy(false);
    // }, 2000);
  };

  const handleEmailAddressChange = (e: ChangeEvent<HTMLInputElement>) => setEmailAddress(e.target.value);

  return (
    <form onSubmit={handleSubmit}>
      <TextField
        inputRef={inputRef}
        label="Your Work Email Address"
        value={emailAddress}
        onChange={handleEmailAddressChange}
        error={Boolean(error)}
        fullWidth
        autoFocus
      />
      <Button type="submit" variant="contained" color="primary" className={classes.button}>
        <CircularProgress
          size={16}
          color="inherit"
          className={classes.progress}
          style={{ visibility: busy ? 'visible' : 'hidden' }}
        />
        <span style={{ visibility: busy ? 'hidden' : 'visible' }}>Next</span>
      </Button>
    </form>
  );
};

export default LoginForm;
