import React, { Fragment, useEffect, useState } from 'react';
import { useHistory, useLocation } from 'react-router-dom';
import queryString from 'querystring';
import omit from 'lodash/omit';
import {
  Button,
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

import firebase from '../firebase';

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    width: '90%',
  },
  instructions: {
    marginBottom: theme.spacing(2),
  },
}));

interface Props {}

const LoginWidget: React.FC<Props> = ({}) => {
  const classes = useStyles();
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
        const result = await firebase.auth().signInWithCustomToken(token);
        setOpen(false);
      } catch (e) {
        console.error(e);
      }
    })();
  }, [token]);

  return (
    <Fragment>
      <Button variant="outlined" onClick={handleOpen}>
        Login
      </Button>
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
    </Fragment>
  );
};

export default LoginWidget;
