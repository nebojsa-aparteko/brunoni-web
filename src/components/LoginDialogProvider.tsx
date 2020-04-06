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
import Context, { Params } from '../contexts/LoginDialog';
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
  const queryParams = location.search ? queryString.parse(location.search.slice(1)) : {};
  const token = queryParams.logIn as string;

  const [params, setParams] = useState<Params | null>(null);
  const [activeStep, setActiveStep] = useState(0);

  const handleOpen = (params?: Params) => {
    setActiveStep(0);
    setParams(params || {});
  };

  const handleClose = () => {
    setParams(null);
    setTimeout(() => {
      setActiveStep(0);
    }, 1000);
  };

  const handleFormComplete = () => setActiveStep(1);

  useEffect(() => {
    if (!token || params) {
      return;
    }

    setActiveStep(2);
    setParams({});

    (async () => {
      try {
        const search = queryString.stringify(omit(queryParams, 'logIn'));
        history.replace({ ...location, search });
        await firebase.auth().signInWithCustomToken(token);
        setParams(null);
        enqueueSnackbar(<Typography color="inherit">Sign in successful!</Typography>, { variant: 'success' });
      } catch (e) {
        setParams(null);
        enqueueSnackbar(<Typography color="inherit">Unable to sign you in.</Typography>, { variant: 'error' });
        console.error(e);
      }
    })();
  }, [token, history, location, params, queryParams, enqueueSnackbar]);

  return (
    <Context.Provider value={{ open: handleOpen }}>
      {children}
      <Dialog open={Boolean(params)} onClose={handleClose} aria-labelledby="form-dialog-title" maxWidth="xs" fullWidth>
        <DialogTitle id="form-dialog-title">Log in</DialogTitle>
        <DialogContent>
          {params?.message && <Typography variant="subtitle1">{params!.message!}</Typography>}
          <div className={classes.root}>
            <Stepper activeStep={activeStep} orientation="vertical">
              <Step>
                <StepLabel>Enter Email Address</StepLabel>
                <StepContent>
                  <Typography className={classes.instructions}>Type in your email address to log in.</Typography>
                  <LoginForm next={params?.next} onComplete={handleFormComplete} />
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
