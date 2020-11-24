import React, { useContext, useEffect, useState } from 'react';
import {
  Box,
  createStyles,
  Dialog,
  DialogContent,
  DialogTitle,
  Grid,
  IconButton,
  Link,
  makeStyles,
  Paper,
  Typography,
} from '@material-ui/core';
import { Booking } from '../../model/Booking';
import CloseIcon from '@material-ui/icons/Close';
import ExpandingBookingContent from '../bookings/documentApproval/ExpandingBookingContent';
import AccountingTabContent from '../bookings/accountingTab/AccountingTabContent';
import firebase from '../../firebase';
import { normalizeBooking } from '../../providers/BookingsProvider';
import ActingAs from '../../contexts/ActingAs';
import { ActivityLogProvider } from '../bookings/checklist/ActivityLogContext';
import ActivityLogContainer from '../bookings/checklist/ActivityLogContainer';

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
      height: '90vh',
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

const getBooking = (bookingId: string) =>
  firebase
    .firestore()
    .collection('bookings')
    .doc(bookingId)
    .get();

const PaymentOverviewDialog: React.FC<Props> = ({ isOpen, handleClose, bookingId }) => {
  const classes = useStyles();
  const actingAs = useContext(ActingAs)[0];
  const [booking, setBooking] = useState<Booking | undefined>();
  useEffect(() => {
    if (!bookingId) return;

    getBooking(bookingId).then(b => {
      const data = b.data();
      setBooking(data ? { id: b.id, ...normalizeBooking(data) } : undefined);
    });
  }, [bookingId]);
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
        {booking && (
          <Link href={`/bookings/${bookingId}`} style={{ marginLeft: 12 }}>
            View Booking
          </Link>
        )}
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
          <Grid
            container
            direction="row"
            spacing={1}
            style={{ display: 'flex', overflow: 'hidden', width: '100%', minHeight: 0 }}
          >
            {booking ? (
              <React.Fragment>
                <Grid item xs={12} md={8} className={classes.bookingViewContainer} style={{ paddingTop: 8 }}>
                  <ExpandingBookingContent booking={booking} initialFreightTab={1} />
                </Grid>
                <Grid item xs={12} md={4} className={classes.bookingViewContainer}>
                  <Paper style={{ display: 'flex', overflow: 'scroll' }}>
                    <AccountingTabContent booking={booking} />
                  </Paper>
                  <Box style={{ flexGrow: 0 }}>
                    <ActivityLogProvider>
                      <ActivityLogContainer booking={booking} isAdmin={!actingAs} isAccounting={true} />
                    </ActivityLogProvider>
                  </Box>
                </Grid>
              </React.Fragment>
            ) : (
              <Typography variant={'h5'} style={{ margin: 'auto' }}>
                It appears that the booking you selected doesn't exist, please contact an administrator for further
                instructions.
              </Typography>
            )}
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
