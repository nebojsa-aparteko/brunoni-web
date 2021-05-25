import React, {
  ChangeEvent,
  Fragment,
  useCallback,
  useContext,
  useEffect,
  useLayoutEffect,
  useMemo,
  useState,
} from 'react';
import {
  Box,
  Button,
  Dialog,
  DialogContent,
  DialogTitle,
  Divider,
  Grid,
  IconButton,
  makeStyles,
  Menu,
  MenuItem,
  Paper,
  TextField,
  Theme,
  Typography,
} from '@material-ui/core';
import PrintIcon from '@material-ui/icons/Print';
import QuoteNav from '../quotes/QuoteItemNav';
import ArchiveIcon from '@material-ui/icons/Archive';
import ActingAs from '../../contexts/ActingAs';
import Page from '../bookings/Page';
import brunoniLogo from '../../assets/logo.brunoni.svg';
import allmarineLogo from '../../assets/logo.allmarine.png';
import { BookingRequest, BookingRequestStatus } from '../../model/BookingRequest';
import BookingRequestViewMainContent from './BookingRequestViewMainContent';
import BookingRequestCheckList from './checklist/BookingRequestChecklist';
import SupervisedUserCircleIcon from '@material-ui/icons/SupervisedUserCircle';
import CloseIcon from '@material-ui/icons/Close';
import UserInput from '../inputs/UserInput';
import useAdminUsers from '../../hooks/useAdminUsers';
import UserRecord, {
  CUSTOMER_FACING_ROLES,
  isDashboardUser,
  UserRecordMin,
  UserRecordMinProperties,
} from '../../model/UserRecord';
import firebase from '../../firebase';
import pick from 'lodash/fp/pick';
import { ActivityChangeType, ActivityLogUserData } from '../bookings/checklist/ChecklistItemModel';
import useUser from '../../hooks/useUser';
import { createActivityObject } from '../bookings/checklist/ChecklistItemRow';
import { ActivityLogItem } from '../bookings/checklist/ActivityModel';
import EditIcon from '@material-ui/icons/Edit';
import { useBookingRequestContext } from '../../providers/BookingRequestProvider';
import omitEmptyDeep from '../../utilities/omitEmptyDeep';
import UserRecordContext from '../../contexts/UserRecordContext';
import { flow, set, isEqual } from 'lodash/fp';
import { BookingCategory } from '../../model/Booking';
import useModal from '../../hooks/useModal';
import ConfirmLeadingCurrencyDialog from './ConfirmLeadingCurrencyDialog';
import Mousetrap from 'mousetrap';
import useGlobalAppState from '../../hooks/useGlobalAppState';
import MissingFields from '../onlineBooking/MissingFields';
import useClientUsers from '../../hooks/useClientUsers';

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
  additionalInfo: {
    padding: theme.spacing(2),
    marginBottom: theme.spacing(1),
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
  actions: {
    '& > *': {
      marginLeft: theme.spacing(1),
    },
  },
  closeModal: {
    position: 'absolute',
    top: '5px',
    right: '12px',
    width: '47px',
    height: '47px',
  },
  dialogBody: {
    minWidth: theme.spacing(100),
    width: 'auto',
    minHeight: theme.spacing(60),
  },
  dialogContent: {
    paddingBottom: theme.spacing(3),
    display: 'flex',
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
    flexDirection: 'column',
  },
  agreementInput: {
    margin: 0,
    marginLeft: '20px',
  },
  saveBtn: {
    margin: theme.spacing(1),
  },
}));

interface AgentAssignmentDialogProps {
  bookingRequest: BookingRequest;
  isOpen: boolean;
  handleClose: () => void;
}

const updateBookingRequest = (bookingRequest: BookingRequest) => {
  if (bookingRequest.id) {
    return firebase
      .firestore()
      .collection('bookings-requests')
      .doc(bookingRequest.id)
      .set(bookingRequest, { merge: true });
  }
  return Promise.resolve();
};

const changeAssignedAgent = (id: string, user: UserRecordMin | null) =>
  firebase
    .firestore()
    .collection('bookings-requests')
    .doc(id)
    .set(
      {
        assignedUser: user ? pick(UserRecordMinProperties)(user) : null,
      },
      { merge: true },
    );
const changeAssignedClient = (id: string, user: UserRecord | null) =>
  firebase
    .firestore()
    .collection('bookings-requests')
    .doc(id)
    .set(
      {
        createdBy: user ? pick(UserRecordMinProperties)(user) : null,
      },
      { merge: true },
    );

//TODO delete and use the booking activity after we generalize it?
const addActivityItem = (bookingId: string, activityLog: ActivityLogItem) => {
  return firebase
    .firestore()
    .collection('bookings-requests')
    .doc(bookingId)
    .collection('activity')
    .doc()
    .set(activityLog);
};

const AgentAssignmentDialog: React.FC<AgentAssignmentDialogProps> = ({ bookingRequest, isOpen, handleClose }) => {
  const classes = useStyles();
  const userRecord = useUser()[1];
  const assignableUsers = useAdminUsers(CUSTOMER_FACING_ROLES);
  const assignableCustomers = useClientUsers(bookingRequest.client?.id);
  const [selectedAgent, setSelectedAgent] = useState<UserRecordMin | null>();
  const [selectedClient, setSelectedClient] = useState<UserRecord | null>();
  const [, dispatch] = useGlobalAppState();

  const getActivityLogUserData = useCallback(
    (user: UserRecord | UserRecordMin | null | undefined): ActivityLogUserData =>
      ({
        firstName: user?.firstName,
        lastName: user?.lastName,
        alphacomClientId: user?.alphacomClientId,
        alphacomId: user?.alphacomId,
        emailAddress: user?.emailAddress,
      } as ActivityLogUserData),
    [userRecord],
  );

  const handleChangeClient = () => {
    dispatch({ type: 'START_GLOBAL_LOADING' });
    bookingRequest.id &&
      selectedClient &&
      changeAssignedClient(bookingRequest.id, selectedClient)
        .then(() =>
          addActivityItem(
            bookingRequest.id || '',
            createActivityObject({
              changeType: ActivityChangeType.ASSIGNED_CLIENT,
              by: getActivityLogUserData(userRecord),
              addedUsers: [getActivityLogUserData(selectedClient)],
            }),
          ),
        )
        .then(() => {
          dispatch({ type: 'STOP_GLOBAL_LOADING' });
        })
        .catch(() => {
          dispatch({ type: 'STOP_GLOBAL_LOADING' });
          return dispatch({ type: 'SHOW_ERROR_SNACKBAR', message: 'Failed to set Client!' });
        });
  };

  const handleChangeAgent = () => {
    dispatch({ type: 'START_GLOBAL_LOADING' });
    bookingRequest.id &&
      selectedAgent &&
      changeAssignedAgent(bookingRequest.id, selectedAgent)
        .then(() =>
          addActivityItem(
            bookingRequest.id || '',
            createActivityObject({
              changeType: ActivityChangeType.ASSIGNED_AGENT,
              by: getActivityLogUserData(userRecord),
              addedUsers: [getActivityLogUserData(selectedAgent)],
            }),
          ),
        )
        .then(() => {
          dispatch({ type: 'STOP_GLOBAL_LOADING' });
        })
        .catch(() => {
          dispatch({ type: 'STOP_GLOBAL_LOADING' });
          return dispatch({ type: 'SHOW_ERROR_SNACKBAR', message: 'Failed to set Agent!' });
        });
  };

  return (
    <Dialog open={isOpen} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle disableTypography>
        <Typography variant="h4">Watchers</Typography>
        <IconButton onClick={handleClose} className={classes.closeModal}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent className={classes.dialogContent}>
        <Box my={1}>
          <UserInput
            value={bookingRequest.assignedUser}
            label="Assigned Agent"
            users={assignableUsers || []}
            onChange={(_, user) => setSelectedAgent(user)}
          />
        </Box>
        <Box my={1}>
          <UserInput
            value={bookingRequest.createdBy}
            label="Assigned Client"
            users={assignableCustomers || []}
            onChange={(_, user) => setSelectedClient(user)}
          />
        </Box>
      </DialogContent>
      <Button
        onClick={() => {
          handleChangeAgent();
          handleChangeClient();
          handleClose();
        }}
        variant="contained"
        className={classes.saveBtn}
        color="primary"
      >
        Save
      </Button>
    </Dialog>
  );
};

export const getBookingRequestTitle = (bookingRequest?: BookingRequest) => {
  return bookingRequest?.carrier?.id?.toUpperCase() || '';
};

function ScrollToTopOnMount() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return null;
}

const BookingRequestView: React.FC<Props> = ({ bookingRequest }) => {
  const actingAs = useContext(ActingAs)[0];
  const classes = useStyles();
  const [isAssignmentDialogOpen, setIsAssignmentDialogOpen] = useState(false);
  const [printRequested, setPrintRequested] = useState(false);
  const [isPrintWithCost, setPrintWithCost] = useState(false);
  const [bookingRequestState, setBookingRequestState, editing, setEditing] = useBookingRequestContext();
  const [agreementNumber, setAgreementNumber] = useState<string>(
    bookingRequestState ? bookingRequestState.agreementNo || '' : bookingRequest.agreementNo || '',
  );
  const [, dispatch] = useGlobalAppState();
  const userRecord = useContext(UserRecordContext);
  const { open, closeModal, openModal } = useModal();

  useEffect(() => {
    setBookingRequestState && setBookingRequestState(bookingRequest);
    setAgreementNumber(bookingRequest.agreementNo || '');
  }, [bookingRequest]);

  useEffect(() => {
    Mousetrap.bind(['command+shift+e', 'ctrl+shift+e'], () => setEditing(prevState => !prevState));
    return () => {
      Mousetrap.unbind(['command+shift+e', 'ctrl+shift+e']);
    };
  }, [setEditing]);

  const handleCloseAssignmentDialog = () => setIsAssignmentDialogOpen(false);

  const onArchiveClick = useCallback(
    () =>
      firebase
        .firestore()
        .collection('bookings-requests')
        .doc(bookingRequest?.id)
        .update('archived', !bookingRequest.archived),
    [bookingRequest],
  );

  const storeActivity = useCallback(
    (checklistItemActivityHandler: () => Promise<void | any>) => {
      checklistItemActivityHandler()
        .then(_ => {
          dispatch({ type: 'SHOW_SUCCESS_SNACKBAR', message: 'Saved message!' });
        })
        .catch(error => {
          console.error('error storing activity', error);
          dispatch({ type: 'SHOW_ERROR_SNACKBAR', message: error.message });
        });
    },
    [dispatch],
  );

  const [anchorEl, setAnchorEl] = React.useState(null);

  const checkIfUserCanEdit = useCallback(() => {
    return !(
      [BookingRequestStatus.ARCHIVED, BookingRequestStatus.CONFIRMED].includes(bookingRequest.status) ||
      (BookingRequestStatus.REQUESTED !== bookingRequest.status && !isDashboardUser(userRecord))
    );
  }, [bookingRequest]);

  const canEdit = useMemo(() => checkIfUserCanEdit(), [checkIfUserCanEdit]);

  const handleClickMenu = (event: any) => {
    setAnchorEl(event.currentTarget);
  };

  const handleCancelEditing = () => {
    setBookingRequestState && setBookingRequestState(bookingRequest);
    setEditing(false);
  };
  console.log(bookingRequestState?.isScheduleChanged);
  const handleSave = useCallback(() => {
    const br = !isEqual(bookingRequest.schedule, bookingRequestState?.schedule)
      ? ({ ...bookingRequestState, isScheduleChanged: true } as BookingRequest)
      : ({ ...bookingRequestState } as BookingRequest);
    omitEmptyDeep(br);
    setEditing(false);
    dispatch({ type: 'START_GLOBAL_LOADING' });
    if (bookingRequestState) {
      updateBookingRequest(br)
        ?.then(() => {
          dispatch({ type: 'SHOW_SUCCESS_SNACKBAR', message: 'Saved changes!' });
        })
        .catch(error => {
          console.error('error saving booking request', error);
          dispatch({ type: 'SHOW_ERROR_SNACKBAR', message: error.message });
        })
        .finally(() => {
          dispatch({ type: 'STOP_GLOBAL_LOADING' });
        });
    }
  }, [bookingRequestState, dispatch, setEditing]);

  useEffect(() => {
    editing && Mousetrap.bind(['command+shift+s', 'ctrl+shift+s'], () => handleSave());
    Mousetrap.stopCallback = () => false;

    return () => {
      Mousetrap.unbind(['command+shift+s', 'ctrl+shift+s']);
    };
  }, [editing, handleSave]);

  const bookNow = useCallback(() => {
    // if freight has ocean freight create leading currency
    // if not choose between eur and usd
    const freight = bookingRequest.freightDetails?.filter(f => ['Oceanfreight', 'Seafreight'].includes(f.Txt));

    if (freight && freight.length > 0) {
      const f = freight?.pop();
      if (!f?.Currency) return openModal();
      setBookingRequestState(prevState => prevState && set('leadingCurrency', f?.Currency)(prevState));
    }
  }, [bookingRequest]);

  const handleChangeAgreementNumberText = (event: ChangeEvent<HTMLInputElement>) => {
    setAgreementNumber(event.target.value);
  };

  const handleChangeAgreementNumber = (v: string) => {
    bookingRequestState && setBookingRequestState && setBookingRequestState(set('agreementNo', v)(bookingRequestState));
  };

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

  const archiveHandler = () =>
    onArchiveClick().then(() =>
      addActivityItem(
        bookingRequest.id!,
        createActivityObject({
          changeType: !bookingRequest.archived ? ActivityChangeType.ARCHIVED : ActivityChangeType.UNARCHIVED,
          by: getActivityLogUserData(),
        }),
      ),
    );

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
      <Grid item md={7} xs={12}>
        <Page title={getBookingRequestTitle(bookingRequest)}>
          <MissingFields bookingRequest={bookingRequest} />
          {bookingRequest.additionalInfo && (
            <Paper className={classes.additionalInfo}>
              <Typography variant="h4" gutterBottom>
                Special requests:
              </Typography>
              <Typography>{bookingRequest.additionalInfo}</Typography>
            </Paper>
          )}
          {isAssignmentDialogOpen ? (
            <AgentAssignmentDialog
              bookingRequest={bookingRequest}
              isOpen={true}
              handleClose={handleCloseAssignmentDialog}
            />
          ) : null}
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
                {editing && isDashboardUser(userRecord) ? (
                  <TextField
                    label="Agreement No."
                    margin="dense"
                    variant="outlined"
                    value={agreementNumber}
                    onChange={handleChangeAgreementNumberText}
                    onBlur={event => handleChangeAgreementNumber(event.target.value)}
                    className={classes.agreementInput}
                  />
                ) : (
                  <Typography variant={'h5'} style={{ paddingLeft: '20px' }}>
                    {agreementNumber !== '' ? 'Agreement No. ' + agreementNumber : 'Agreement No. [To be assigned]'}
                  </Typography>
                )}
              </Box>
              <Box flex="1" />
              {!editing && isDashboardUser(userRecord) && (
                <Button
                  color={'primary'}
                  variant="contained"
                  onClick={bookNow}
                  size="small"
                  style={{ marginLeft: '1em' }}
                >
                  Book now
                </Button>
              )}
              <Box className={classes.actions} displayPrint="none">
                {editing && (
                  <>
                    <Button variant="contained" onClick={handleCancelEditing} size="small">
                      Cancel
                    </Button>
                    <Button
                      color={'primary'}
                      variant="contained"
                      onClick={handleSave}
                      size="small"
                      style={{ marginLeft: '1em' }}
                    >
                      Save changes
                    </Button>
                  </>
                )}
                {!editing && (
                  <IconButton
                    size="small"
                    aria-label="Edit"
                    component="span"
                    onClick={() => setEditing(true)}
                    disabled={!canEdit}
                  >
                    <EditIcon />
                  </IconButton>
                )}
                <IconButton
                  size="small"
                  aria-label="Watch"
                  component="span"
                  onClick={() => setIsAssignmentDialogOpen(true)}
                >
                  <SupervisedUserCircleIcon />
                </IconButton>
                {!actingAs && (
                  <Fragment>
                    <Button
                      aria-label="archive"
                      variant="outlined"
                      size="small"
                      startIcon={<ArchiveIcon />}
                      onClick={() => storeActivity(archiveHandler)}
                    >
                      {bookingRequest.archived ? 'Restore' : 'Archive'}
                    </Button>
                  </Fragment>
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
              <BookingRequestViewMainContent isPrintWithCost={isPrintWithCost} />
            </Grid>
          </Paper>
        </Page>
      </Grid>
      <Grid item md={4} xs={12}>
        <Box id="checklistBkg" displayPrint="none">
          <BookingRequestCheckList bookingRequest={bookingRequest} />
        </Box>
      </Grid>
      <ConfirmLeadingCurrencyDialog
        isOpen={open}
        handleConfirm={currency => {
          setBookingRequestState(prevState => prevState && set('leadingCurrency', currency)(prevState));
          closeModal();
        }}
        handleClose={handleClose}
      />
    </Grid>
  );
};

interface Props {
  bookingRequest: BookingRequest;
}

export default BookingRequestView;

const createAlphacomReq = (request: BookingRequest) =>
  flow(
    set('Agreement', request.agreementNo),
    set('BL-No', request.blNumber),
    set('BkgAgentContact', request.assignedUser?.alphacomId),
    set('BkgAgentContactEml', request.assignedUser?.emailAddress),
    set('BkgAgentContactTxt', `${request.assignedUser?.firstName} ${request.assignedUser?.lastName}`),
    set('BkgCreateTimeStamp', new Date()),
    set('BkgTouchTimeStamp', new Date()),
    set('CarrierID', request.carrier?.name),
    set('category', BookingCategory.Export),
    // set('CargoDetails')
    set('ForwAdrCity', request.createdBy?.company?.city),
    set('ForwAdrId', request.createdBy?.company?.id),
    set('ForwAdrName', request.createdBy?.company?.name),
    set('ForwPersID', request.createdBy?.alphacomId),
    set('ForwarderPersTxt', `${request.createdBy?.firstName} ${request.createdBy?.lastName}`),
    set('FreightDetails', request.freightDetails),
    set('leadingCurrency', request.leadingCurrency),
    set('schedule', request.schedule),
  )({});
