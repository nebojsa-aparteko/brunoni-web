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
import { ActivityChangeType, ActivityLogUserData } from './checklist/ChecklistItemModel';
import { addActivityItem } from './checklist/ActivityLogContainer';
import { createActivityObject } from './checklist/ChecklistItemRow';
import useFirestoreCollection from '../../hooks/useFirestoreCollection';
import PinnedActivities from './PinnedActivities';
import { ActivityLogItem } from './checklist/ActivityModel';
import map from 'lodash/fp/map';
import { flow } from 'lodash/fp';
import update from 'lodash/fp/update';
import invoke from 'lodash/fp/invoke';
import { normalizePaymentActivityData } from './documentApproval/ComparisonDialogContent';
import TagsList from '../tags/TagsList';
import { TagCategory } from '../../model/Tag';
import PromoBox from '../PromoBox';
import Tags from '../../contexts/Tags';

const mediaPrint = '@media print';
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

    [mediaPrint]: {
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

    [mediaPrint]: {
      marginTop: theme.spacing(0),
      paddingTop: theme.spacing(0),
    },
  },
  logo: {
    width: '5em',
    [mediaPrint]: {
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
    [mediaPrint]: {
      marginBottom: theme.spacing(0),
    },
  },
  tableWrapper: {
    overflowX: 'auto',
    [mediaPrint]: {
      width: '30%',
    },
  },
  actions: {
    '& > *': {
      marginLeft: theme.spacing(1),
    },
  },
  hidePrint: {
    [mediaPrint]: {
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
  const availableTags = useContext(Tags);
  const actingAs = useContext(ActingAs)[0];
  const isAdmin = !actingAs;
  const classes = useStyles();
  const userRecord = useUser()[1];
  const { enqueueSnackbar } = useSnackbar();
  const [, dispatch] = useContext(GlobalContext);
  const [printRequested, setPrintRequested] = useState(false);
  const [isPrintWithCost, setPrintWithCost] = useState(false);
  const [isOpenWatcherDialog, setIsOpenWatcherDialog] = useState(false);
  const [tags, setTags] = useState(
    availableTags && availableTags.filter(tag => booking.assignedTags && booking.assignedTags.includes(tag.id)),
  );
  const [selectedTab, setSelectedTab] = useState(userRecord.lastOpenedChecklistTab || 'operations');

  const handleCloseWatcherDialog = () => setIsOpenWatcherDialog(false);

  useEffect(
    () =>
      setTags(
        availableTags && availableTags.filter(tag => booking.assignedTags && booking.assignedTags.includes(tag.id)),
      ),
    [availableTags, booking.assignedTags],
  );

  const pinnedActivities = useFirestoreCollection(
    'bookings',
    useCallback(
      query => {
        const queryByAdminRole = isAdmin ? query : query.where('isInternal', '==', isAdmin);
        return queryByAdminRole.where('isPinned', '==', true).orderBy('at', 'desc');
      },
      [isAdmin],
    ),
    booking.id,
    'activity',
  )?.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
  }));
  const normalizedPinnedActivities = useMemo(
    () =>
      map(flow(update('at', invoke('toDate')), update('paymentActivityData', normalizePaymentActivityData)))(
        pinnedActivities,
      ) as ActivityLogItem[],
    [pinnedActivities],
  );

  const tasks = useTasksPerBooking(booking.id);

  const filteredTasks = useMemo(() => {
    return tasks?.filter(task =>
      task.taskCategory ? task.taskCategory === selectedTab.toUpperCase() : selectedTab === 'operations',
    );
  }, [tasks, userRecord]);

  const getActivityLogUserData = useCallback(
    (): ActivityLogUserData =>
      ({
        firstName: userRecord?.firstName,
        lastName: userRecord?.lastName,
        alphacomClientId: userRecord?.alphacomClientId,
        alphacomId: userRecord?.alphacomId,
        emailAddress: userRecord?.emailAddress,
      } as ActivityLogUserData),
    [userRecord],
  );

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
        .then(_ => {
          dispatch({
            type: SHOW_SUCCESS_SNACKBAR,
            message: isWatching ? 'Successfully removed from watchers!' : 'Successfully added to watchers!',
          });
          return addActivityItem(
            booking!.id,
            createActivityObject({
              changeType: isWatching ? ActivityChangeType.UNSET_WATCHING : ActivityChangeType.SET_WATCHING,
              by: getActivityLogUserData(),
            }),
          );
        })
        .then(() => {
          console.log(isWatching ? 'Successfully removed from watchers!' : 'Successfully added to watchers!');
        })
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

  const getCorrectBackRoute = () => {
    if (!booking.archived && booking.pendingPayment) {
      return '/bookings?tab=pending-payment';
    } else if (booking.archived && !booking.pendingPayment) {
      return '/bookings?tab=archived';
    } else {
      return '/bookings';
    }
  };

  return (
    <Grid container direction="row" spacing={2} justify="center" alignItems="flex-start" className={classes.body}>
      {normalizedPinnedActivities === undefined && (
        <Grid item xs={12} md={11}>
          <Box displayPrint="none" display="flex" justifyContent="center" height={78}>
            <Paper style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <CircularProgress style={{ margin: 'auto' }} />
            </Paper>
          </Box>
        </Grid>
      )}
      {isAdmin && normalizedPinnedActivities && normalizedPinnedActivities.length > 0 && (
        <Grid item xs={12} md={11}>
          <Box displayPrint="none">
            <PinnedActivities pinnedActivities={normalizedPinnedActivities} booking={booking} />
          </Box>
        </Grid>
      )}
      {tasks === undefined && (
        <Grid item xs={12} md={11}>
          <Box displayPrint="none" display="flex" justifyContent="center" height={78}>
            <Paper style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <CircularProgress style={{ margin: 'auto' }} />
            </Paper>
          </Box>
        </Grid>
      )}
      {filteredTasks && filteredTasks.length > 0 && (
        <Grid item xs={12} md={11}>
          <Box displayPrint="none">
            <BookingTaskExpansionPanel tasks={filteredTasks} selectedTab={selectedTab} />
          </Box>
        </Grid>
      )}
      <Grid container item md={7} xs={12}>
        <Grid item xs={12}>
          {isAdmin &&
            (tags ? (
              <TagsList tags={tags || []} tagCategory={TagCategory.BOOKING} documentId={booking.id} />
            ) : (
              <Box
                display="flex"
                flexDirection="row"
                mb={1}
                alignItems="center"
                border="1px solid rgba(0,0,0,0.15)"
                p={1}
                maxWidth="100%"
              >
                <CircularProgress size={20} style={{ margin: 'auto' }} />
              </Box>
            ))}
        </Grid>

        <Page title={getBookingTitle(booking)}>
          {isOpenWatcherDialog ? (
            <WatchersDialog booking={booking} isOpen={true} handleClose={handleCloseWatcherDialog} id={booking.id} />
          ) : null}
          <ScrollToTopOnMount />
          <Paper className={classes.root}>
            <PromoBox />
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
                  backTo={getCorrectBackRoute()}
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
              {selectedTab === 'accounting' ? (
                <ExpandingBookingContent booking={booking} isPrintWithCost={isPrintWithCost} />
              ) : (
                <BookingViewMainContent booking={booking} isPrintWithCost={isPrintWithCost} />
              )}
            </Grid>
          </Paper>
        </Page>
      </Grid>
      <Grid item md={4} xs={12}>
        <Box id="checklistBkg" displayPrint="none">
          <CheckList booking={booking} onTabChange={setSelectedTab} tasks={tasks} />
        </Box>
      </Grid>
    </Grid>
  );
};

export default BookingView;
