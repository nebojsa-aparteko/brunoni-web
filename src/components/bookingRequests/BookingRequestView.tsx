import React, { Fragment, useCallback, useContext, useEffect, useLayoutEffect, useMemo, useState } from 'react';
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
import { Booking, BookingCategory, BookingVersion } from '../../model/Booking';
import QuoteNav from '../quotes/QuoteItemNav';
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
import { GlobalContext } from '../../store/GlobalStore';
import { SHOW_SUCCESS_SNACKBAR } from '../../store/types/globalAppState';
import useFirestoreCollection from '../../hooks/useFirestoreCollection';
import map from 'lodash/fp/map';
import { flow } from 'lodash/fp';
import update from 'lodash/fp/update';
import invoke from 'lodash/fp/invoke';
import Page from '../bookings/Page';
import { addActivityItem } from '../bookings/checklist/ActivityLogContainer';
import { createActivityObject } from '../bookings/checklist/ChecklistItemRow';
import { ActivityChangeType, ActivityLogUserData } from '../bookings/checklist/ChecklistItemModel';
import { ActivityLogItem } from '../bookings/checklist/ActivityModel';
import { normalizePaymentActivityData } from '../bookings/documentApproval/ComparisonDialogContent';
import brunoniLogo from '../../assets/logo.brunoni.svg';
import allmarineLogo from '../../assets/logo.allmarine.png';
import { BookingRequest } from '../../model/BookingRequest';
import BookingRequestViewMainContent from './BookingRequestViewMainContent';

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
  logo: {
    width: '5em',
    ['@media print']: {
      width: '20em',
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
  bookingRequest: BookingRequest;
}

export const getBookingRequestTitle = (bookingRequest?: BookingRequest) => {
  return bookingRequest?.carrier?.id?.toUpperCase() || '';
};

function ScrollToTopOnMount() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return null;
}

// export const isLongVersion = (version: BookingVersion) => {
//   return version === 'Long';
// };
//
// export const isImport = (category: BookingCategory) => {
//   return category === BookingCategory.Import;
// };
//
// const handleWatch = (id: string, watchers: UserRecord[]) =>
//   firebase
//     .firestore()
//     .collection('bookings')
//     .doc(id)
//     .update(
//       'watchers',
//       watchers.map(item => pick(UserRecordMinProperties)(item)),
//     );

const BookingRequestView: React.FC<Props> = ({ bookingRequest }) => {
  const actingAs = useContext(ActingAs)[0];
  // const isAdmin = !actingAs;
  const classes = useStyles();
  // const userRecord = useUser()[1];
  // const { enqueueSnackbar } = useSnackbar();
  // const [, dispatch] = useContext(GlobalContext);
  const [printRequested, setPrintRequested] = useState(false);
  const [isPrintWithCost, setPrintWithCost] = useState(false);
  // const [isOpenWatcherDialog, setIsOpenWatcherDialog] = useState(false);

  // const handleCloseWatcherDialog = () => setIsOpenWatcherDialog(false);

  // const pinnedActivities = useFirestoreCollection(
  //   'bookings',
  //   useCallback(
  //     query => {
  //       const queryByAdminRole = isAdmin ? query : query.where('isInternal', '==', isAdmin);
  //       return queryByAdminRole.where('isPinned', '==', true).orderBy('at', 'desc');
  //     },
  //     [isAdmin],
  //   ),
  //   bookingRequest.id,
  //   'activity',
  // )?.docs.map(doc => ({
  //   id: doc.id,
  //   ...doc.data(),
  // }));
  // const normalizedPinnedActivities = useMemo(
  //   () =>
  //     map(flow(update('at', invoke('toDate')), update('paymentActivityData', normalizePaymentActivityData)))(
  //       pinnedActivities,
  //     ) as ActivityLogItem[],
  //   [pinnedActivities],
  // );

  // const getActivityLogUserData = useCallback(
  //   (): ActivityLogUserData =>
  //     ({
  //       firstName: userRecord?.firstName,
  //       lastName: userRecord?.lastName,
  //       alphacomClientId: userRecord?.alphacomClientId,
  //       alphacomId: userRecord?.alphacomId,
  //       emailAddress: userRecord?.emailAddress,
  //     } as ActivityLogUserData),
  //   [userRecord],
  // );

  const onArchiveClick = useCallback(() => {
    // firebase
    //   .firestore()
    //   .collection('booking-requests')
    //   .doc(bookingRequest?.id)
    //   .update('archived', !bookingRequest?.archived);
    //
    // // if the booking was in dispute and action is to archive it
    // // this is expected to be very rare so leave it as a separate call
    // if (bookingRequest.inDispute && !bookingRequest.archived) {
    //   firebase
    //     .firestore()
    //     .collection('booking-requests')
    //     .doc(bookingRequest?.id)
    //     .update('inDispute', false);
    // }
  }, [bookingRequest]);

  // const onWatch = useCallback(
  //   (isWatching: boolean) => {
  // handleWatch(
  //   bookingRequest.id,
  //   isWatching
  //     ? bookingRequest.watchers.filter(u => u.alphacomId !== userRecord.alphacomId)
  //     : [...(bookingRequest.watchers || []), userRecord],
  // )
  //   .then(_ => {
  //     dispatch({
  //       type: SHOW_SUCCESS_SNACKBAR,
  //       message: isWatching ? 'Successfully removed from watchers!' : 'Successfully added to watchers!',
  //     });
  //     return addActivityItem(
  //       bookingRequest!.id,
  //       createActivityObject({
  //         changeType: isWatching ? ActivityChangeType.UNSET_WATCHING : ActivityChangeType.SET_WATCHING,
  //         by: getActivityLogUserData(),
  //       }),
  //     );
  //   })
  //   .then(() => {
  //     console.log(isWatching ? 'Successfully removed from watchers!' : 'Successfully added to watchers!');
  //   })
  //   .catch(err => console.log(err));
  //   },
  //   [bookingRequest.id, userRecord, enqueueSnackbar, dispatch],
  // );
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
      {/*{normalizedPinnedActivities === undefined && (*/}
      {/*  <Grid item xs={12} md={11}>*/}
      {/*    <Box displayPrint="none" display="flex" justifyContent="center" height={78}>*/}
      {/*      <Paper style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>*/}
      {/*        <CircularProgress style={{ margin: 'auto' }} />*/}
      {/*      </Paper>*/}
      {/*    </Box>*/}
      {/*  </Grid>*/}
      {/*)}*/}
      <Grid item md={7} xs={12}>
        <Page title={getBookingRequestTitle(bookingRequest)}>
          <ScrollToTopOnMount />
          <Paper className={classes.root}>
            <Box display="none" displayPrint="block" mb={2}>
              <Box mb={2}>
                <img
                  src={process.env.REACT_APP_BRAND === 'brunoni' ? brunoniLogo : allmarineLogo}
                  alt=""
                  className={classes.logo}
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
                  title={`Booking Request - ${getBookingRequestTitle(bookingRequest)}`}
                  subtitle={`File No. ${bookingRequest.id}`}
                />
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
                      {'Archive'}
                    </Button>
                  </Fragment>
                )}

                {/*{actingAs === null &&*/}
                {/*(isDashboardUser(userRecord) || bookingRequest.assignedUser.alphacomId === userRecord.alphacomId) ? (*/}
                {/*  <IconButton size="small" onClick={() => setIsOpenWatcherDialog(true)}>*/}
                {/*    <SupervisedUserCircleIcon />*/}
                {/*  </IconButton>*/}
                {/*) : (*/}
                {/*  <WatcherIconButton*/}
                {/*    isWatching={bookingRequest.watchers?.findIndex(val => val.alphacomId === userRecord.alphacomId) !== -1}*/}
                {/*    handleWatch={onWatch}*/}
                {/*  />*/}
                {/*)}*/}

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
              <BookingRequestViewMainContent bookingRequest={bookingRequest} isPrintWithCost={isPrintWithCost} />
            </Grid>
          </Paper>
        </Page>
      </Grid>
      <Grid item md={4} xs={12}>
        <Box id="checklistBkg" displayPrint="none">
          {/*<CheckList booking={booking} onTabChange={setSelectedTab} tasks={tasks} />*/}
        </Box>
      </Grid>
    </Grid>
  );
};

export default BookingRequestView;
