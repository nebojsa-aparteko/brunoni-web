import React, { Fragment, useCallback, useContext, useEffect, useLayoutEffect, useState } from 'react';
import {
  Box,
  Button,
  CircularProgress,
  Divider,
  Grid,
  IconButton,
  makeStyles,
  Menu,
  MenuItem,
  Paper,
  Theme,
  Typography,
} from '@material-ui/core';
import pick from 'lodash/fp/pick';
import PrintIcon from '@material-ui/icons/Print';
import Page from './Page';
import { Booking, BookingCategory, BookingVersion } from '../../model/Booking';
import QuoteNav from '../quotes/QuoteItemNav';
import CheckList from './checklist/CheckList';
import ArchiveIcon from '@material-ui/icons/Archive';
import firebase from '../../firebase';
import ActingAs from '../../contexts/ActingAs';
import WatchersDialog from '../watchers/WatchersDialog';
import SupervisedUserCircleIcon from '@material-ui/icons/SupervisedUserCircle';
import useUser from '../../hooks/useUser';
import UserRecord, { isDashboardUser, UserRecordMinProperties } from '../../model/UserRecord';
import { useSnackbar } from 'notistack';
import WatcherIconButton from '../watchers/WatcherIconButton';
import WarningIcon from '@material-ui/icons/Warning';
import useTasksPerBooking from '../../hooks/useTasksPerBooking';
import BookingTaskExpansionPanel from './BookingTaskExpansionPanel';
import brunoniLogo from '../../assets/logo.brunoni.png';
import allmarineLogo from '../../assets/logo.allmarine.png';
import BookingViewMainContent from './BookingViewMainContent';
import ExpandingBookingContent from './documentApproval/ExpandingBookingContent';
import { GlobalContext } from '../../store/GlobalStore';
import { SHOW_SUCCESS_SNACKBAR } from '../../store/types/globalAppState';

const useStyles = makeStyles((theme: Theme) => ({
  body: {
    marginTop: theme.spacing(4),
    marginBottom: theme.spacing(4),
    width: '100%',
    margin: 0,

    [theme.breakpoints.down('sm')]: {
      padding: theme.spacing(2),
      paddingTop: theme.spacing(3),
    },

    ['@media print']: {
      marginTop: theme.spacing(0),
      paddingTop: theme.spacing(0),
    },
  },
  root: {
    padding: theme.spacing(3),

    [theme.breakpoints.down('sm')]: {
      padding: theme.spacing(2),
      paddingTop: theme.spacing(3),
    },

    ['@media print']: {
      marginTop: theme.spacing(0),
      paddingTop: theme.spacing(0),
    },
  },
  title: {
    fontSize: '1.2em',
  },
  actionBar: {
    [theme.breakpoints.down('sm')]: {
      flexDirection: 'column',
    },
    ['@media print']: {
      marginBottom: theme.spacing(0),
    },
  },
  tableWrapper: {
    overflowX: 'auto',
    ['@media print']: {
      width: '30%',
    },
  },
  actions: {
    '& > *': {
      marginLeft: theme.spacing(1),
    },
  },
  hidePrint: {
    ['@media print']: {
      display: 'none',
    },
  },
}));

interface Props {
  booking: Booking;
}

export const getBookingTitle = (booking?: Booking) => {
  return booking?.CarrierID?.toUpperCase() || '';
};

function ScrollToTopOnMount() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return null;
}

export const isLongVersion = (version: BookingVersion) => {
  return version === 'Long';
};

export const isImport = (category: BookingCategory) => {
  return category === BookingCategory.Import;
};

const handleWatch = (id: string, watchers: UserRecord[]) =>
  firebase
    .firestore()
    .collection('bookings')
    .doc(id)
    .update(
      'watchers',
      watchers.map(item => pick(UserRecordMinProperties)(item)),
    );

const BookingView: React.FC<Props> = ({ booking }) => {
  const actingAs = useContext(ActingAs)[0];
  const classes = useStyles();
  const userRecord = useUser()[1];
  const { enqueueSnackbar } = useSnackbar();
  const [, dispatch] = useContext(GlobalContext);
  const [printRequested, setPrintRequested] = useState(false);
  const [isPrintWithCost, setPrintWithCost] = useState(false);
  const [isOpenWatcherDialog, setIsOpenWatcherDialog] = useState(false);
  const [selectedTab, setSelectedTab] = useState(localStorage.getItem('checklistTab'));

  const handleCloseWatcherDialog = () => setIsOpenWatcherDialog(false);

  const tasks = useTasksPerBooking(booking.id);

  const onArchiveClick = useCallback(() => {
    firebase
      .firestore()
      .collection('bookings')
      .doc(booking?.id)
      .update('archived', !booking?.archived);

    // if the booking was in dispute and action is to archive it
    // this is expected to be very rare so leave it as a separate call
    if (booking.inDispute && !booking.archived) {
      firebase
        .firestore()
        .collection('bookings')
        .doc(booking?.id)
        .update('inDispute', false);
    }
  }, [booking]);

  const onDisputeClick = useCallback(() => {
    firebase
      .firestore()
      .collection('bookings')
      .doc(booking?.id)
      .update('inDispute', !booking?.inDispute);
  }, [booking]);

  const onWatch = useCallback(
    (isWatching: boolean) => {
      handleWatch(
        booking.id,
        isWatching
          ? booking.watchers.filter(u => u.alphacomId !== userRecord.alphacomId)
          : [...(booking.watchers || []), userRecord],
      )
        .then(_ =>
          dispatch({
            type: SHOW_SUCCESS_SNACKBAR,
            message: isWatching ? 'Successfully removed from watchers!' : 'Successfully added to watchers!',
          }),
        )
        .catch(err => console.log(err));
    },
    [booking.id, booking.watchers, userRecord, enqueueSnackbar, dispatch],
  );
  const [anchorEl, setAnchorEl] = React.useState(null);

  const handleClickMenu = (event: any) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };
  useLayoutEffect(() => {
    if (printRequested) {
      window.print();
      setPrintRequested(false);
    }
  }, [printRequested]);
  return (
    <Grid container direction="row" spacing={2} justify="center" alignItems="flex-start" className={classes.body}>
      {tasks === undefined && (
        <Grid item xs={12} md={11}>
          <Box displayPrint="none" display="flex" justifyContent="center" height={78}>
            <Paper style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <CircularProgress style={{ margin: 'auto' }} />
            </Paper>
          </Box>
        </Grid>
      )}
      {tasks && tasks.length > 0 && (
        <Grid item xs={12} md={11}>
          <Box displayPrint="none">
            <BookingTaskExpansionPanel tasks={tasks} />
          </Box>
        </Grid>
      )}
      <Grid item md={7} xs={12}>
        <Page title={getBookingTitle(booking)}>
          <WatchersDialog
            booking={booking}
            isOpen={isOpenWatcherDialog}
            handleClose={handleCloseWatcherDialog}
            id={booking.id}
          />
          <ScrollToTopOnMount />
          <Paper className={classes.root}>
            <Box display="none" displayPrint="block" mb={2}>
              <Box mb={2}>
                <img
                  src={process.env.REACT_APP_BRAND === 'brunoni' ? brunoniLogo : allmarineLogo}
                  alt=""
                  style={{ width: '5em' }}
                />
              </Box>
              <Divider />
            </Box>

            <Box className={classes.actionBar} mb={2} display="flex" alignItems="end" justifyContent="space-between">
              <Box
                className={classes.actionBar}
                mb={2}
                display="flex"
                flexDirection="row"
                alignItems="end"
                justifyContent="space-between"
              >
                <QuoteNav
                  backTo="/bookings"
                  title={`Booking - ${getBookingTitle(booking)}`}
                  subtitle={`File No. ${booking.id}`}
                />
                <Typography variant={'h5'} style={{ paddingLeft: '20px' }}>
                  {booking?.Agreement
                    ? 'Agreement No. ' + booking?.Agreement
                    : booking?.StatClientRef
                    ? 'Agreement No. ' + booking.StatClientRef
                    : null}
                </Typography>
              </Box>
              <Box flex="1" />
              <Box className={classes.actions} displayPrint="none">
                {!actingAs && (
                  <Fragment>
                    <Button
                      aria-label="archive"
                      variant="outlined"
                      size="small"
                      startIcon={<ArchiveIcon />}
                      onClick={onArchiveClick}
                    >
                      {booking.archived ? 'Restore' : 'Archive'}
                    </Button>
                    {booking.pendingPayment && !booking.archived && (
                      <Button
                        aria-label="dispute"
                        variant="outlined"
                        size="small"
                        startIcon={<WarningIcon />}
                        onClick={onDisputeClick}
                        disabled={booking.inDispute}
                      >
                        {booking.inDispute ? 'in dispute' : 'Dispute'}
                      </Button>
                    )}
                  </Fragment>
                )}

                {actingAs === null &&
                (isDashboardUser(userRecord) || booking.assignedUser.alphacomId === userRecord.alphacomId) ? (
                  <IconButton size="small" onClick={() => setIsOpenWatcherDialog(true)}>
                    <SupervisedUserCircleIcon />
                  </IconButton>
                ) : (
                  <WatcherIconButton
                    isWatching={booking.watchers?.findIndex(val => val.alphacomId === userRecord.alphacomId) !== -1}
                    handleWatch={onWatch}
                  />
                )}

                <IconButton aria-label="print" size="small" onClick={handleClickMenu}>
                  <PrintIcon />
                </IconButton>
                <Menu id="simple-menu" anchorEl={anchorEl} keepMounted open={Boolean(anchorEl)} onClose={handleClose}>
                  <MenuItem
                    onClick={() => {
                      setPrintWithCost(false);
                      setPrintRequested(true);
                      handleClose();
                    }}
                  >
                    Print without costs
                  </MenuItem>
                  <MenuItem
                    onClick={() => {
                      setPrintWithCost(true);
                      setPrintRequested(true);
                      handleClose();
                    }}
                  >
                    Print with cost
                  </MenuItem>
                </Menu>
              </Box>
            </Box>

            <Grid item xs={12}>
              {selectedTab === '1' ? (
                <ExpandingBookingContent booking={booking} isPrintWithCost={isPrintWithCost} />
              ) : (
                <BookingViewMainContent booking={booking} isPrintWithCost={isPrintWithCost} />
              )}
            </Grid>
          </Paper>
        </Page>
      </Grid>
      <Grid item md={4} xs={12}>
        <Box displayPrint="none">
          <CheckList booking={booking} onTabChange={setSelectedTab} />
        </Box>
      </Grid>
    </Grid>
  );
};

export default BookingView;
