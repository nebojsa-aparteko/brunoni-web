import React, { useEffect, useState } from 'react';
import { useHistory, useLocation } from 'react-router-dom';
import queryString from 'querystring';
import { useSnackbar } from 'notistack';
import omit from 'lodash/omit';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  makeStyles,
  Theme,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  Typography,
  CircularProgress,
} from '@material-ui/core';

import LoginForm from './LoginForm';
import Context from '../contexts/LoginDialog';
import firebase from '../firebase';

interface Props {
  children: React.ReactNode;
}

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    width: '90%',
  },
  instructions: {
    marginBottom: theme.spacing(2),
  },
}));

const LoginDialogProvider: React.FC<Props> = ({ children }) => {
  const classes = useStyles();
  const { enqueueSnackbar } = useSnackbar();
  const location = useLocation();
  const history = useHistory();
  const params = location.search ? queryString.parse(location.search.slice(1)) : {};
  const token = params.logIn as string;

  const [open, setOpen] = useState(false);
  const [activeStep, setActiveStep] = useState(0);

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const handleFormComplete = () => setActiveStep(1);

  useEffect(() => {
    if (!token || open) {
      return;
    }

    setActiveStep(2);
    setOpen(true);

    (async () => {
      try {
        const search = queryString.stringify(omit(params, 'logIn'));
        history.replace({ ...location, search });
        await firebase.auth().signInWithCustomToken(token);
        setOpen(false);
        enqueueSnackbar(<Typography color="inherit">Sign in successful!</Typography>, { variant: 'success' });
      } catch (e) {
        setOpen(false);
        enqueueSnackbar(<Typography color="inherit">Unable to sign you in.</Typography>, { variant: 'error' });
        console.error(e);
      }
    })();
  }, [token, history, location, open, params, enqueueSnackbar]);

  return (
    <Context.Provider value={{ open: handleOpen }}>
      {children}
      <Dialog open={open} onClose={handleClose} aria-labelledby="form-dialog-title" maxWidth="xs" fullWidth>
        <DialogTitle id="form-dialog-title">Log in</DialogTitle>
        <DialogContent>
          <div className={classes.root}>
            <Stepper activeStep={activeStep} orientation="vertical">
              <Step>
                <StepLabel>Enter Email Address</StepLabel>
                <StepContent>
                  <Typography className={classes.instructions}>Type in your email address to log in.</Typography>
                  <LoginForm onComplete={handleFormComplete} />
                </StepContent>
              </Step>
              <Step>
                <StepLabel>Open Email</StepLabel>
                <StepContent>
                  <Typography>We’ve sent you an email with further instructions.</Typography>
                  <Typography>Check your inbox.</Typography>
                </StepContent>
              </Step>
              <Step>
                <StepLabel>Log in</StepLabel>
                <StepContent>
                  <Typography display="inline">Logging you in…</Typography>
                  <CircularProgress size={22} />
                </StepContent>
              </Step>
            </Stepper>
          </div>
        </DialogContent>
      </Dialog>
    </Context.Provider>
  );
};

export default LoginDialogProvider;
