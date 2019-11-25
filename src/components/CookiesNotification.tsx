import React, { useState, useEffect } from 'react';
import Cookies from 'js-cookie';
import { makeStyles, Theme } from '@material-ui/core';
import { ReactComponent as CookieLove } from '../assets/undraw_cookie_love_ulvn.svg';
import { Paper, Typography, Link, Button } from '@material-ui/core';

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    maxWidth: 420,
    position: 'fixed',
    bottom: 0,
    right: 0,
    margin: theme.spacing(3),
    outline: 'none',
    zIndex: 2000,
  },
  media: {
    padding: theme.spacing(1, 2),
    height: 180,
    textAlign: 'center',
    '& > img': {
      height: '100%',
      width: 'auto',
    },
  },
  content: {
    padding: theme.spacing(1, 2),
  },
  actions: {
    padding: theme.spacing(2),
  },
}));

interface Props {}

const CookiesNotification: React.FC<Props> = () => {
  const classes = useStyles();
  const [open, setOpen] = useState(false);

  const handleClose = () => {
    Cookies.set('consent', 'true');
    setOpen(false);
  };

  useEffect(() => {
    const consent = Cookies.get('consent');

    if (!consent) {
      setOpen(true);
    }
  }, []);

  if (!open) {
    return null;
  }

  return (
    <Paper className={classes.root} elevation={3}>
      <div className={classes.media}>
        <CookieLove />
      </div>
      <div className={classes.content}>
        <Typography variant="body1">
          We use Cookies to ensure that we give you the best experience on our website. Read our{' '}
          <Link component="a" href="https://www.brunoni.ch/2-uncategorised/116-data-protection" target="_blank">
            Privacy Policy
          </Link>
          .
        </Typography>
      </div>
      <div className={classes.actions}>
        <Button color="primary" onClick={handleClose} variant="contained">
          I Agree
        </Button>
      </div>
    </Paper>
  );
};

export default CookiesNotification;
