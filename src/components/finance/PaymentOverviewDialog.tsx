import React, { useContext, useEffect, useState } from 'react';
import {
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
import BookingTaskExpansionPanel from '../bookings/BookingTaskExpansionPanel';
import useTasksPerBooking from '../../hooks/useTasksPerBooking';

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
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'left',
    },
    bookingLink: {
      marginLeft: 12,
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
    bookingTasksContainer: {
      flex: '0 0 auto',
      padding: 4,
      maxHeight: '30%',
      overflow: 'scroll',
    },
    mainContentContainer: {
      flex: '1 1 auto',
      padding: 4,
      marginTop: 8,
      height: '68%',
    },
    gridContainer: {
      display: 'flex',
      flexGrow: 1,
      overflow: 'hidden',
      height: '100%',
    },
    bookingContentContainer: {
      paddingTop: 8,
      maxHeight: '100%',
      overflow: 'scroll',
    },
    accountingTabContainer: {
      maxHeight: '55%',
      overflow: 'scroll',
      flex: '1 0 auto',
    },
    activityLogContainer: {
      overflow: 'scroll',
      flex: '1 1 auto',
      marginTop: 4,
    },
    noBookingText: {
      margin: 'auto',
    },
  }),
);

const getBooking = (bookingId: string) =>
  firebase
    .firestore()
    .collection('bookings')
    .doc(bookingId)
    .get();

const PaymentOverviewDialog: React.FC<Props> = ({ isOpen, handleClose, bookingId, updateComponent }) => {
  const classes = useStyles();
  const actingAs = useContext(ActingAs)[0];
  const [booking, setBooking] = useState<Booking | undefined>();
  const tasks = useTasksPerBooking(bookingId || '');

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
      <DialogTitle disableTypography id="dialog-title-check-list" className={classes.dialogTitleBar}>
        <Typography variant="h4">{`File No: ${bookingId}`}</Typography>
        {booking && (
          <Link href={`/bookings/${bookingId}`} target="_blank" className={classes.bookingLink}>
            View Booking
          </Link>
        )}
        <IconButton onClick={handleClose} className={classes.closeModal}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent className={classes.dialogContent}>
        {tasks && tasks.length > 0 && (
          <Paper elevation={2} className={classes.bookingTasksContainer}>
            <BookingTaskExpansionPanel tasks={tasks} />
          </Paper>
        )}
        <Paper elevation={2} className={classes.mainContentContainer}>
          <ActivityLogProvider>
            {booking ? (
              <Grid container direction="row" spacing={1} className={classes.gridContainer}>
                <Grid item xs={12} md={8} className={classes.bookingContentContainer}>
                  <ExpandingBookingContent booking={booking} initialFreightTab={1} />
                </Grid>
                <Grid item xs={12} md={4} className={classes.bookingViewContainer}>
                  <Paper elevation={2} className={classes.accountingTabContainer}>
                    <AccountingTabContent booking={booking} updateComponent={updateComponent} />
                  </Paper>
                  <Paper elevation={2} className={classes.activityLogContainer}>
                    <ActivityLogContainer booking={booking} isAdmin={!actingAs} isAccounting={true} />
                  </Paper>
                </Grid>
              </Grid>
            ) : (
              <Typography variant={'h5'} className={classes.noBookingText}>
                It appears that the booking you selected doesn't exist, please contact an administrator for further
                instructions.
              </Typography>
            )}
          </ActivityLogProvider>
        </Paper>
      </DialogContent>
    </Dialog>
  );
};

interface Props {
  isOpen: boolean;
  handleClose: () => void;
  bookingId: string | undefined;
  updateComponent?: () => void;
}

export default PaymentOverviewDialog;
