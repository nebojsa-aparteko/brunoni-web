import React, {
  ChangeEvent,
  Fragment,
  useCallback,
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
import { ActivityChangeType, ActivityLogUserData } from '../bookings/checklist/ChecklistItemModel';
import useUser from '../../hooks/useUser';
import { createActivityObject } from '../bookings/checklist/ChecklistItemRow';
import { useBookingRequestContext } from '../../providers/BookingRequestProvider';
import omitEmptyDeep from '../../utilities/omitEmptyDeep';
import { flow, isEqual, keys, map, omit, pick, set, update } from 'lodash/fp';
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
import createAlphacomRepresentationOfBooking from '../../utilities/createAlphacomRepresentationOfBooking';
// import ChargeCodes from '../../contexts/ChargeCodes';
// import { validate } from '@material-ui/pickers';
// import createAlphacomRepresentationOfBooking from '../../utilities/createAlphacomRepresentationOfBooking';
// import ChargeCodes from '../../contexts/ChargeCodes';
import { ChangedField } from '../bookings/checklist/ActivityModel';
import useActivities from '../../hooks/useActivities';
import PinnedActivities from '../bookings/PinnedActivities';

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
    //console.log('Update Itinerary', bookingRequest.itinerary);

    return firebase
      .firestore()
      .collection('bookings-requests')
      .doc(bookingRequest.id)
      .set(
        update(
          'containers',
          map((value: any) =>
            flow(
              update('imo', val => (val?.[0] ? val[1] : null)),
              update('oog', val => (val?.[0] ? val[1] : null)),
            )(value),
          ),
        )(bookingRequest),
        // { merge: true },
      );
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

  console.log('prev selectedAgent');
  console.log(bookingRequest.assignedUser);

  console.log('curr selectedAgent');
  console.log(selectedAgent);

  console.log('prev selectedClient');
  console.log(bookingRequest.createdBy);

  console.log('curr selectedClient');
  console.log(selectedClient);

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
      if (
        bookingRequest.id &&
        selectedClient &&
        bookingRequest.createdBy?.emailAddress !== selectedClient.emailAddress
      ) {
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
      if (
        bookingRequest.id &&
        selectedAgent &&
        bookingRequest.assignedUser?.emailAddress !== selectedAgent.emailAddress
      ) {
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
  const [, userRecord, actingAs] = useUser();
  const isAdmin = userRecord.isAdmin;
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

  const [agreementNumber, setAgreementNumber] = useState<string>(
    bookingRequestState?.agreementNo || bookingRequest.agreementNo || '',
  );
  const [, dispatch] = useGlobalAppState();
  const getActivityLogUserData = useActivityLogUserData();
  const bookingRequestPath = useMemo(() => `/bookings-requests/${bookingRequest.id}/activity`, [bookingRequest.id]);

  const activities = useActivities(
    bookingRequestPath,
    useCallback(
      query => {
        const queryByAdminRole = isAdmin ? query : query.where('isInternal', '==', isAdmin);
        return queryByAdminRole.where('isPinned', '==', true).orderBy('at', 'desc');
      },
      [isAdmin],
    ),
  );

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
    //console.log('Itinerary', br.itinerary);
    if (br) {
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
  }, [bookingRequestState, bookingRequest]);

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

  const bookNow = useCallback(() => {
    // if freight has ocean freight create leading currency
    // if not choose between eur and usd
    const freight = bookingRequestState?.freightDetails?.filter(f => ['Oceanfreight', 'Seafreight'].includes(f.Txt));

    if (freight && freight.length > 0) {
      const f = freight?.pop();
      if (!f?.Currency) return openModal();
      setBookingRequestState(prevState => set('leadingCurrency', f?.Currency)(prevState!));
    } else {
      return openModal();
    }
  }, [bookingRequestState]);

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

  useLayoutEffect(() => {
    if (printRequested) {
      window.print();
      setPrintRequested(false);
    }
  }, [printRequested]);

  const createChangedFieldsObject = (changedKeys: string[], oldVal: any, newVal: any) => {
    const changedFields: ChangedField[] = [];
    changedKeys.forEach(key => {
      changedFields.push({
        fieldName: key,
        oldVal: oldVal[key],
        newVal: newVal[key],
      } as ChangedField);
    });
    return changedFields;
  };

  const handleFieldsEditActivity = async () => {
    //todo. without freight details for now?... Because it change at beggining
    const newObject = difference(omit('freightDetails')(bookingRequestState), omit('freightDetails')(bookingRequest));

    // console.log('new Object')
    // console.log(newObject)

    const changedKeys = keys(newObject);
    // console.log('changedKeys')
    // console.log(changedKeys)

    const oldObject = pick(changedKeys, bookingRequest);
    // console.log('old Object')
    // console.log(oldObject)

    const changedFields = createChangedFieldsObject(changedKeys, oldObject, newObject);
    // console.log('changedFields')
    // console.log(changedFields)

    if (changedKeys.length > 0) {
      await addActivityItem(
        'bookings-requests',
        bookingRequest.id!,
        createActivityObject({
          changeType: ActivityChangeType.EDITED,
          by: getActivityLogUserData,
          changedFields,
        }),
      );
    }
  };
  // const chargeCodes = useContext(ChargeCodes);
  // const filteredChargeCodes = useMemo(() => (chargeCodes ? chargeCodes.filter(code => code.language === 'E') : []), [
  //   chargeCodes,
  // ]);
  return (
    <Grid container direction="row" spacing={2} justify="center" alignItems="flex-start" className={classes.body}>
      <Button
        onClick={() => createAlphacomReq(bookingRequest, filteredChargeCodes).then(result => console.log(result))}
      >
        Test
      </Button>
      <Grid item md={7} xs={12}>
        <Page title={getBookingRequestTitle(bookingRequest)}>
          <MissingFields bookingRequest={bookingRequest} />
          {activities && activities?.length > 0 && (
            <Box my={2}>
              <Box displayPrint="none">
                <PinnedActivities
                  pinnedActivities={activities}
                  collection={'bookings-requests'}
                  docId={bookingRequest.id}
                />
              </Box>
            </Box>
          )}
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
const createAlphacomReq = async (bookingRequest: BookingRequest, filteredChargeCodes: any) => {
  console.log(await createAlphacomRepresentationOfBooking(bookingRequest, filteredChargeCodes));
  // throw new Error('Function not implemented.');
};

function filteredChargeCodes(bookingRequest: BookingRequest, filteredChargeCodes: any) {
  throw new Error('Function not implemented.');
}
