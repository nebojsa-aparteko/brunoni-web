import React, { useState } from 'react';
import {
  Box,
  Button,
  Checkbox,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  FormControlLabel,
  IconButton,
  makeStyles,
  Theme,
  Typography,
} from '@material-ui/core';
import CloseIcon from '@material-ui/icons/Close';
import { guideButtonShepherdTour } from './guides/GuideButtonGuide';
import { navbarShepherdTour } from './guides/NavbarGuide';
import useUser from '../hooks/useUser';
import firebase from '../firebase';

const useStyles = makeStyles((theme: Theme) => ({
  closeModal: {
    position: 'absolute',
    top: '5px',
    right: '12px',
    width: '47px',
    height: '47px',
  },
  dialogActions: {
    display: 'flex',
    justifyContent: 'space-evenly',
    alignItems: 'center',
  },
  content: {
    margin: theme.spacing(3),
  },
}));

interface ConfirmationDialogProps {
  isOpen: boolean;
  handleClose: () => void;
}

const GuideDialog: React.FC<ConfirmationDialogProps> = ({ isOpen, handleClose }) => {
  const classes = useStyles();
  const [user] = useUser();
  const [isChecked, setIsChecked] = useState<boolean>(false);

  const handleSkip = async () => {
    if (isChecked) {
      await firebase
        .firestore()
        .collection('users')
        .doc(user.uid)
        .set({ dontShowGuide: true }, { merge: true });
    }
    handleClose();
    guideButtonShepherdTour.start();
  };

  const handleStartGuide = () => {
    handleClose();
    navbarShepherdTour.start();
  };

  return (
    <Dialog open={isOpen} onClose={handleClose} maxWidth="sm" fullWidth>
      <Box>
        <DialogTitle disableTypography>
          <Typography variant="h4">
            {localStorage.getItem('finishedNavbarGuide') !== 'true'
              ? 'Would you like to start a guided tour of the site?'
              : 'Would you like to start one of the following guides?'}
          </Typography>
          <IconButton onClick={handleClose} className={classes.closeModal}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        {localStorage.getItem('finishedNavbarGuide') !== 'true' ? (
          <DialogContent>
            <Typography variant="body1">
              The guide can help you familiarize yourself with the site if you haven't used it
              before.
            </Typography>
          </DialogContent>
        ) : null}

        <Divider />

        <DialogActions className={classes.dialogActions}>
          {localStorage.getItem('finishedNavbarGuide') !== 'true' ? (
            <React.Fragment>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={isChecked}
                    onChange={event => setIsChecked(event.target.checked)}
                    color="primary"
                  />
                }
                label="Don't show this again"
              />
              <Button onClick={handleSkip} color="primary" variant="outlined">
                Skip for now
              </Button>
              <Button onClick={handleStartGuide} color="primary" variant="contained">
                Start guided tour
              </Button>
            </React.Fragment>
          ) : (
            <React.Fragment>
              <Button color="primary" variant="outlined" size="large">
                My Day
              </Button>
              <Button onClick={() => {}} color="primary" variant="outlined" size="large">
                Bookings
              </Button>
              <Button onClick={() => {}} color="primary" variant="outlined" size="large">
                Quotes
              </Button>
            </React.Fragment>
          )}
        </DialogActions>
      </Box>
    </Dialog>
  );
};

export default GuideDialog;
