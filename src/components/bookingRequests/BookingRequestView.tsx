import React, {
  ChangeEvent,
  Fragment,
  useCallback,
  useContext,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
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
  Paper,
  TextField,
  Theme,
  Typography,
} from '@material-ui/core';
import PrintIcon from '@material-ui/icons/Print';
import QuoteNav from '../quotes/QuoteItemNav';
import ArchiveIcon from '@material-ui/icons/Archive';
import Page from '../bookings/Page';
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
import { useBookingRequestContext } from '../../providers/BookingRequestProvider';
import omitEmptyDeep from '../../utilities/omitEmptyDeep';
import { isEqual, set, omit, keys } from 'lodash/fp';
import useModal from '../../hooks/useModal';
import ConfirmLeadingCurrencyDialog from './ConfirmLeadingCurrencyDialog';
import Mousetrap from 'mousetrap';
import useGlobalAppState from '../../hooks/useGlobalAppState';
import MissingFields from '../onlineBooking/MissingFields';
import useClientUsers from '../../hooks/useClientUsers';
import useActivityLogUserData from '../../hooks/useActivityLogUserData';
import { RouteSearchResult } from '../../model/route-search/RouteSearchResults';
import { getPortOfLoadingFromIntermediatePorts, hasPlaceOfReceipt } from './BookingRequestSummary';
import DropdownMenu from '../DropdownMenu';
import LogoImage from '../LogoImage';
import BookNowButton from '../BookNowButton';
import EditButton from '../EditButton';
import { addActivityItem } from '../../utilities/activityHelper';
import { difference } from '../../utilities/getDifferenceObject';
import { WeeklyPaymentApiAction } from '../../model/WeeklyPayment';
import { addDays } from 'date-fns';
import createAlphacomRepresentationOfBooking from '../../utilities/createAlphacomRepresentationOfBooking';
import ChargeCodes from '../../contexts/ChargeCodes';

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
  specialRequests: {
    padding: theme.spacing(2),
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
const AgentAssignmentDialog: React.FC<AgentAssignmentDialogProps> = ({ bookingRequest, isOpen, handleClose }) => {
  const classes = useStyles();
  const userRecord = useUser()[1];
  const assignableUsers = useAdminUsers(CUSTOMER_FACING_ROLES);
  const assignableCustomers = useClientUsers(bookingRequest.client?.id);
  const [selectedAgent, setSelectedAgent] = useState<UserRecordMin | undefined>(bookingRequest.assignedUser);
  const [selectedClient, setSelectedClient] = useState<UserRecord | undefined>(bookingRequest.createdBy);
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
    [],
  );

  const handleChangeClient = async () => {
    try {
      if (bookingRequest.id && selectedClient) {
        await changeAssignedClient(bookingRequest.id, selectedClient);
        await addActivityItem(
          'bookings-requests',
          bookingRequest.id,
          createActivityObject({
            changeType: ActivityChangeType.ASSIGNED_CLIENT,
            by: getActivityLogUserData(userRecord),
            addedUsers: [getActivityLogUserData(selectedClient)],
          }),
        );
      }
    } catch (e) {
      console.log(e);
      return dispatch({ type: 'SHOW_ERROR_SNACKBAR', message: 'Failed to set Client!' });
    }
  };

  const handleChangeAgent = async () => {
    dispatch({ type: 'START_GLOBAL_LOADING' });
    try {
      if (bookingRequest.id && selectedAgent) {
        await changeAssignedAgent(bookingRequest.id, selectedAgent);
        await addActivityItem(
          'bookings-requests',
          bookingRequest.id,
          createActivityObject({
            changeType: ActivityChangeType.ASSIGNED_AGENT,
            by: getActivityLogUserData(userRecord),
            addedUsers: [getActivityLogUserData(selectedAgent)],
          }),
        );
      }
    } catch (e) {
      console.log(e);
      return dispatch({ type: 'SHOW_ERROR_SNACKBAR', message: 'Failed to set Agent!' });
    }
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
            value={selectedAgent}
            label="Assigned Agent"
            users={assignableUsers || []}
            onChange={(_, user) => setSelectedAgent(user || undefined)}
          />
        </Box>
        <Box my={1}>
          <UserInput
            value={selectedClient}
            label="Assigned Client"
            users={assignableCustomers || []}
            onChange={(_, user) => setSelectedClient(user || undefined)}
          />
        </Box>
      </DialogContent>
      <Button
        onClick={async () => {
          dispatch({ type: 'START_GLOBAL_LOADING' });
          await handleChangeAgent();
          await handleChangeClient();
          dispatch({ type: 'STOP_GLOBAL_LOADING' });
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
  return bookingRequest?.carrier?.name?.toUpperCase() || '';
};

function ScrollToTopOnMount() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return null;
}

type DropdownMenuHandle = React.ElementRef<typeof DropdownMenu>;

const BookingRequestView: React.FC<Props> = ({ bookingRequest }) => {
  const [user, userRecord, isAdmin] = useUser();
  const classes = useStyles();
  const { isOpen, openModal, closeModal } = useModal();
  const {
    isOpen: isOpenAssignmentModal,
    closeModal: closeAssignmentModal,
    openModal: openAssignmentModal,
  } = useModal();
  const [printRequested, setPrintRequested] = useState(false);
  const [isPrintWithCost, setPrintWithCost] = useState(false);
  const [bookingRequestState, setBookingRequestState, editing, setEditing] = useBookingRequestContext();
  const menuRef = useRef<DropdownMenuHandle>();
  const chargeCodes = useContext(ChargeCodes);
  const [agreementNumber, setAgreementNumber] = useState<string>(
    bookingRequestState?.agreementNo || bookingRequest.agreementNo || '',
  );
  const [, dispatch] = useGlobalAppState();
  const getActivityLogUserData = useActivityLogUserData();

  const canEdit = useMemo(
    () =>
      !(
        [BookingRequestStatus.ARCHIVED, BookingRequestStatus.CONFIRMED].includes(bookingRequest.status) ||
        (BookingRequestStatus.REQUESTED !== bookingRequest.status && !isDashboardUser(userRecord))
      ),
    [bookingRequest, userRecord],
  );

  useEffect(() => {
    setBookingRequestState(bookingRequest);
    setAgreementNumber(bookingRequest.agreementNo || '');
  }, [bookingRequest]);

  useEffect(() => {
    Mousetrap.bind(['command+shift+e', 'ctrl+shift+e'], () => setEditing(prevState => !prevState));
    return () => {
      Mousetrap.unbind(['command+shift+e', 'ctrl+shift+e']);
    };
  }, []);

  const handleSave = useCallback(() => {
    const br = !isEqual(bookingRequest.schedule, bookingRequestState?.schedule)
      ? ({ ...bookingRequestState, isScheduleChanged: true } as BookingRequest)
      : bookingRequestState;
    omitEmptyDeep(br);
    dispatch({ type: 'START_GLOBAL_LOADING' });
    if (bookingRequestState) {
      updateBookingRequest({ ...br!, agreementNo: agreementNumber })
        ?.then(() => {
          dispatch({ type: 'SHOW_SUCCESS_SNACKBAR', message: 'Saved changes!' });
        })
        .catch(error => {
          console.error('error saving booking request', error);
          dispatch({ type: 'SHOW_ERROR_SNACKBAR', message: error.message });
        })
        .finally(async () => {
          setEditing(false);
          try {
            await handleFieldsEditActivity();
          } catch (error) {
            console.error('error creating activity', error);
            dispatch({ type: 'SHOW_ERROR_SNACKBAR', message: error.message });
          } finally {
            dispatch({ type: 'STOP_GLOBAL_LOADING' });
          }
        });
    }
  }, [bookingRequestState, dispatch, setEditing]);

  const onArchiveClick = useCallback(
    () =>
      firebase
        .firestore()
        .collection('bookings-requests')
        .doc(bookingRequest?.id)
        .update('archived', !bookingRequest.archived),
    [bookingRequest],
  );

  const onHoldClick = useCallback(
    () =>
      firebase
        .firestore()
        .collection('bookings-requests')
        .doc(bookingRequest?.id)
        .update('hold', !bookingRequest.hold),
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

  const handleClickMenu = useCallback(
    event => {
      menuRef.current.openMenu(event);
    },
    [menuRef],
  );

  const handleCancelEditing = useCallback(() => {
    setBookingRequestState(bookingRequest);
    setEditing(false);
  }, [bookingRequest]);

  useEffect(() => {
    editing && Mousetrap.bind(['command+shift+s', 'ctrl+shift+s'], () => handleSave());
    Mousetrap.stopCallback = () => false;

    return () => {
      Mousetrap.unbind(['command+shift+s', 'ctrl+shift+s']);
    };
  }, [editing, handleSave]);

  const bookNow = useCallback(async () => {
    // if freight has ocean freight create leading currency
    // if not choose between eur and usd
    const freight = bookingRequestState?.freightDetails?.filter(f => ['Oceanfreight', 'Seafreight'].includes(f.Txt));

    if (freight && freight.length > 0) {
      const f = freight?.pop();
      if (!f?.Currency) return openModal();
      setBookingRequestState(prevState => prevState && set('leadingCurrency', f?.Currency)(prevState));
      try {
        const token = await user.getIdToken();
        console.log('Postponing', await createAlphacomRepresentationOfBooking(bookingRequestState!, chargeCodes));
        const response = await fetch(`${process.env.REACT_APP_API_URL}/bookingRequest`, {
          method: 'POST',
          mode: 'cors',
          cache: 'no-cache',
          credentials: 'include',
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
            'Content-Disposition': 'attachment; filename=test.json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(await createAlphacomRepresentationOfBooking(bookingRequestState!, chargeCodes)),
        });

        if (response.ok) {
          console.log(await response.json());
          // const body = await response.json();
          // console.log('Body', await response.blob());
        } else {
          const body = await response.json();
          console.error(`Failed to request`, response, body);
        }
      } catch (e) {
        console.error('Failed to perform request', e);
      } finally {
      }
    } else {
      return openModal();
    }
  }, [bookingRequestState, user, chargeCodes]);

  const handleChangeAgreementNumberText = useCallback((event: ChangeEvent<HTMLInputElement>) => {
    setAgreementNumber(event.target.value);
  }, []);
  //
  // const handleChangeAgreementNumber = useCallback((v: string) => {
  //   setBookingRequestState(prevState => set('agreementNo', v)(prevState!));
  // }, []);

  const archiveHandler = () =>
    onArchiveClick().then(() =>
      addActivityItem(
        'bookings-requests',
        bookingRequest.id!,
        createActivityObject({
          changeType: !bookingRequest.archived ? ActivityChangeType.ARCHIVED : ActivityChangeType.UNARCHIVED,
          by: getActivityLogUserData,
        }),
      ),
    );
  const holdHandler = () =>
    onHoldClick().then(() =>
      addActivityItem(
        'bookings-requests',
        bookingRequest.id!,
        createActivityObject({
          changeType: !bookingRequest.hold ? ActivityChangeType.PUT_ON_HOLD : ActivityChangeType.REVERT_PUT_ON_HOLD,
          by: getActivityLogUserData,
        }),
      ),
    );

  useLayoutEffect(() => {
    if (printRequested) {
      window.print();
      setPrintRequested(false);
    }
  }, [printRequested]);

  const handleFieldsEditActivity = async () => {
    // without freight details for now
    const differencesObject = difference(
      omit('freightDetails')(bookingRequestState),
      omit('freightDetails')(bookingRequest),
    );
    const changedKeys = keys(differencesObject);

    if (changedKeys.length > 0) {
      await addActivityItem(
        'bookings-requests',
        bookingRequest.id!,
        createActivityObject({
          changeType: ActivityChangeType.EDITED,
          by: getActivityLogUserData,
          changedFields: changedKeys,
        }),
      );
    }
  };

  return (
    <Grid container direction="row" spacing={2} justify="center" alignItems="flex-start" className={classes.body}>
      {/*<Button*/}
      {/*  onClick={() => createAlphacomReq(bookingRequest, filteredChargeCodes).then(result => console.log(result))}*/}
      {/*>*/}
      {/*  Test*/}
      {/*</Button>*/}
      <Grid item md={7} xs={12}>
        <Page title={getBookingRequestTitle(bookingRequest)}>
          <MissingFields bookingRequest={bookingRequest} />
          {bookingRequest.additionalInfo && <AdditionalInfoView additionalInfo={bookingRequest.additionalInfo} />}
          {isOpenAssignmentModal && (
            <AgentAssignmentDialog bookingRequest={bookingRequest} isOpen={true} handleClose={closeAssignmentModal} />
          )}
          <ScrollToTopOnMount />
          <Paper className={classes.root}>
            <Box display="none" displayPrint="block" mb={2}>
              <Box mb={2}>
                <LogoImage className={classes.logo} />
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
                    autoFocus
                    className={classes.agreementInput}
                  />
                ) : (
                  <Typography variant={'h5'} style={{ paddingLeft: '20px' }}>
                    {agreementNumber !== '' ? 'Agreement No. ' + agreementNumber : 'Agreement No. [To be assigned]'}
                  </Typography>
                )}
              </Box>
              <Box flex="1" />
              {!editing && isDashboardUser(userRecord) && <BookNowButton bookNow={bookNow} />}
              <Box className={classes.actions} displayPrint="none">
                <EditButton
                  handleCancelEditing={handleCancelEditing}
                  handleSave={handleSave}
                  disabled={!canEdit}
                  editing={editing}
                  startEditing={() => setEditing(true)}
                />
                <IconButton size="small" aria-label="Watch" component="span" onClick={openAssignmentModal}>
                  <SupervisedUserCircleIcon />
                </IconButton>
                {isAdmin && (
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
                {isAdmin && (
                  <Fragment>
                    <Button
                      aria-label="hold"
                      variant="outlined"
                      size="small"
                      startIcon={<ArchiveIcon />}
                      onClick={() => storeActivity(holdHandler)}
                    >
                      {bookingRequest.hold ? 'Hold' : 'Unhold'}
                    </Button>
                  </Fragment>
                )}

                <IconButton aria-label="print" size="small" onClick={handleClickMenu}>
                  <PrintIcon />
                </IconButton>
                <DropdownMenu
                  ref={menuRef}
                  items={[
                    {
                      onClick: () => {
                        setPrintWithCost(false);
                        setPrintRequested(true);
                      },
                      label: 'Print without costs',
                    },
                    {
                      onClick: () => {
                        setPrintWithCost(true);
                        setPrintRequested(true);
                      },
                      label: 'Print with cost',
                    },
                  ]}
                />
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
      {isOpen && (
        <ConfirmLeadingCurrencyDialog
          isOpen={isOpen}
          handleConfirm={currency => {
            setBookingRequestState(prevState => prevState && set('leadingCurrency', currency)(prevState));
            closeModal();
          }}
          handleClose={closeModal}
        />
      )}
    </Grid>
  );
};

interface Props {
  bookingRequest: BookingRequest;
}

export default BookingRequestView;

export const getVoyageInfo = (schedule?: RouteSearchResult) => {
  if (!schedule) return undefined;
  if (hasPlaceOfReceipt(schedule)) {
    const [d] = getPortOfLoadingFromIntermediatePorts(schedule);
    return d?.VoyageInfo;
  }

  return schedule.OriginInfo.VoyageInfo;
};

const AdditionalInfoView = ({ additionalInfo }: { additionalInfo: string }) => {
  const classes = useStyles();
  return (
    <Paper className={classes.additionalInfo}>
      <Box border={1} borderColor={'primary'} className={classes.specialRequests}>
        <Typography variant="h4" gutterBottom>
          Special requests:
        </Typography>
        <Typography>{additionalInfo}</Typography>
      </Box>
    </Paper>
  );
};
