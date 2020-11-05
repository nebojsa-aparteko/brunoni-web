import React from 'react';
import {
  createStyles,
  Dialog,
  DialogContent,
  DialogTitle,
  Grid,
  IconButton,
  makeStyles,
  Typography,
} from '@material-ui/core';
import { Booking } from '../../model/Booking';
import CloseIcon from '@material-ui/icons/Close';
import ExpandingBookingContent from '../bookings/documentApproval/ExpandingBookingContent';
import useFirestoreDocument from '../../hooks/useFirestoreDocument';
import AccountingTabContent from '../bookings/accountingTab/AccountingTabContent';

const useStyles = makeStyles(() =>
  createStyles({
    dialogPaper: {
      minHeight: '100vh',
      maxHeight: '100vh',
      minWidth: '100vw',
      maxWidth: '100vw',
    },
    dialogTitleBar: {
      height: '48px',
    },
    closeModal: {
      position: 'absolute',
      top: '5px',
      right: '12px',
      width: '47px',
      height: '47px',
    },
    dialogContent: {
      display: 'flex',
      flexFlow: 'column',
    },
    bookingViewContainer: {
      display: 'flex',
      flexDirection: 'column',
      minHeight: 0,
      height: '100%',
      overflow: 'scroll',
    },
  }),
);

const PaymentOverviewDialog: React.FC<Props> = ({ isOpen, handleClose, bookingId }) => {
  const classes = useStyles();
  const bookingSnapshot = useFirestoreDocument('bookings', bookingId);
  const booking = bookingSnapshot ? ({ id: bookingSnapshot.id, ...bookingSnapshot.data() } as Booking) : undefined;

  return (
    <Dialog
      open={isOpen}
      onClose={handleClose}
      aria-labelledby="dialog-title-check-list"
      maxWidth="xl"
      fullWidth
      classes={{ paper: classes.dialogPaper }}
    >
      <DialogTitle
        disableTypography
        id="dialog-title-check-list"
        className={classes.dialogTitleBar}
        style={{ display: 'flex', alignItems: 'center', justifyContent: 'left' }}
      >
        <Typography variant="h4">{`File No: ${bookingId}`}</Typography>
        <IconButton onClick={handleClose} className={classes.closeModal}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent className={classes.dialogContent}>
        <Grid
          container
          direction="column"
          spacing={1}
          className={classes.dialogContent}
          style={{ flex: 1, minHeight: 0, padding: 16, paddingLeft: 22 }}
        >
          <Grid item md style={{ display: 'flex', overflow: 'hidden' }}>
            <Grid
              container
              direction="row"
              spacing={1}
              style={{ flex: 1, overflow: 'hidden', width: '100%', minHeight: 0 }}
            >
              <Grid item xs={12} md={8} className={classes.bookingViewContainer} style={{ paddingTop: 8 }}>
                {booking && <ExpandingBookingContent booking={booking} />}
              </Grid>
              <Grid item xs={12} md={4} className={classes.bookingViewContainer}>
                {booking && <AccountingTabContent booking={booking} />}
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </DialogContent>
    </Dialog>
  );
};

interface Props {
  isOpen: boolean;
  handleClose: () => void;
  bookingId: string | undefined;
}

export default PaymentOverviewDialog;
