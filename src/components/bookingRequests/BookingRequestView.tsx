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
import { BookingRequest, BookingRequestStatus, VGMSubmittedBy } from '../../model/BookingRequest';
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
import { flow, set, isEqual, get, omit } from 'lodash/fp';
import { BookingCategory, BookingVersion } from '../../model/Booking';
import useModal from '../../hooks/useModal';
import ConfirmLeadingCurrencyDialog from './ConfirmLeadingCurrencyDialog';
import Mousetrap from 'mousetrap';
import useGlobalAppState from '../../hooks/useGlobalAppState';
import MissingFields from '../onlineBooking/MissingFields';
import useClientUsers from '../../hooks/useClientUsers';
import useActivityLogUserData from '../../hooks/useActivityLogUserData';
import { RouteSearchResult } from '../../model/route-search/RouteSearchResults';
import {
  getItineraryFromSchedule,
  getPortOfLoadingFromIntermediatePorts,
  hasPlaceOfReceipt,
} from './BookingRequestSummary';
import { formatDateSafe } from '../../utilities/formattingHelpers';
import ContainerDetails from '../../model/ContainerDetails';
import Container from '../../model/Container';
import { getRepresentationFromClient } from './BookingRequestPortTerms';
import Client from '../../model/Client';
import ChargeCode from '../../model/ChargeCode';
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
          bookingRequest.id || '',
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
          bookingRequest.id || '',
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

const BookingRequestView: React.FC<Props> = ({ bookingRequest }) => {
  const actingAs = useContext(ActingAs)[0];
  const classes = useStyles();
  const chargeCodes = useContext(ChargeCodes) as ChargeCode[];
  const { isOpen, openModal, closeModal } = useModal();
  const [printRequested, setPrintRequested] = useState(false);
  const [isPrintWithCost, setPrintWithCost] = useState(false);
  const [bookingRequestState, setBookingRequestState, editing, setEditing] = useBookingRequestContext();
  const [agreementNumber, setAgreementNumber] = useState<string>(
    bookingRequestState ? bookingRequestState.agreementNo || '' : bookingRequest.agreementNo || '',
  );
  const [, dispatch] = useGlobalAppState();
  const userRecord = useContext(UserRecordContext);
  const {
    isOpen: isOpenAssignmentModal,
    closeModal: closeAssignmentModal,
    openModal: openAssignmentModal,
  } = useModal();

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

  const filteredChargeCodes = useMemo(() => (chargeCodes ? chargeCodes.filter(code => code.language === 'E') : []), [
    chargeCodes,
  ]);

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
    } else {
      return openModal();
    }
  }, [bookingRequest]);

  const handleChangeAgreementNumberText = (event: ChangeEvent<HTMLInputElement>) => {
    setAgreementNumber(event.target.value);
  };

  const handleChangeAgreementNumber = (v: string) => {
    bookingRequestState && setBookingRequestState && setBookingRequestState(set('agreementNo', v)(bookingRequestState));
  };

  const getActivityLogUserData = useActivityLogUserData();

  const archiveHandler = () =>
    onArchiveClick().then(() =>
      addActivityItem(
        bookingRequest.id!,
        createActivityObject({
          changeType: !bookingRequest.archived ? ActivityChangeType.ARCHIVED : ActivityChangeType.UNARCHIVED,
          by: getActivityLogUserData,
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
      <Button
        onClick={() => createAlphacomReq(bookingRequest, filteredChargeCodes).then(result => console.log(result))}
      >
        Test
      </Button>
      <Grid item md={7} xs={12}>
        <Page title={getBookingRequestTitle(bookingRequest)}>
          <MissingFields bookingRequest={bookingRequest} />
          {bookingRequest.additionalInfo && (
            <Paper className={classes.additionalInfo}>
              <Box border={1} borderColor={'primary'} className={classes.specialRequests}>
                <Typography variant="h4" gutterBottom>
                  Special requests:
                </Typography>
                <Typography>{bookingRequest.additionalInfo}</Typography>
              </Box>
            </Paper>
          )}
          {isOpenAssignmentModal ? (
            <AgentAssignmentDialog bookingRequest={bookingRequest} isOpen={true} handleClose={closeAssignmentModal} />
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
      {isOpen && (
        <ConfirmLeadingCurrencyDialog
          isOpen={isOpen}
          handleConfirm={currency => {
            setBookingRequestState(prevState => prevState && set('leadingCurrency', currency)(prevState));
            closeModal();
          }}
          handleClose={handleClose}
        />
      )}
    </Grid>
  );
};

interface Props {
  bookingRequest: BookingRequest;
}

export default BookingRequestView;

const getTariffs = (container: Container & ContainerDetails) => {
  const tariffs = [];
  if (container.demDetTariffs && container.demDetTariffs.length > 0) {
    tariffs.push({
      Type: 'DEM/DET',
      ID: container.demDetTariffs[0].id,
    });
  }
  if (container.storageTariffs && container.storageTariffs.length > 0) {
    tariffs.push({
      Type: 'STORAGE',
      ID: container.storageTariffs[0].id,
    });
  }
  if (container.pluginTariffs && container.pluginTariffs.length > 0) {
    tariffs.push({
      Type: 'PLUGIN',
      ID: container.pluginTariffs[0].id,
    });
  }
  return tariffs;
};

const twentyFootContainers = ["20'DC", "20'SO", "20'FR", "20'PF", "20'SR", "20'RF", "20'TK", "20'OT"];
const fortyFootContainers = ["40'DC", "40'SO", "40'FR", "40'PF", "40'SR", "40'OT", "40'HC", "40'FH", "40'RH", "40'OH"];

const getRelevantUnit = (unit: string) => {
  if (unit === 'PRO CONTAINER' || unit === 'PER CONTAINER') return 'CTR';
  if (unit === 'PRO SENDUNG' || unit === 'PER SHIPMENT') return 'FEE';
  if (unit === 'PRO SET' || unit === 'PER SET') return 'SET';
  if (unit === 'PRO TEU' || unit === 'PER TEU') return 'TEU';
  if (twentyFootContainers.some(containerName => unit === 'PRO ' + containerName || unit === 'PER ' + containerName))
    return "20'";
  if (fortyFootContainers.some(containerName => unit === 'PRO ' + containerName || unit === 'PER ' + containerName))
    return "40'";
  return unit;
};

const fetchClientByAlphacomId = async (alphacomId: string) =>
  await firebase
    .firestore()
    .collection('clients')
    .doc(alphacomId)
    .get();

const createAlphacomReq = async (request: BookingRequest, chargeCodes: ChargeCode[] | undefined) => {
  const [erpCarrierId, erpServiceId] = request.schedule?.Service?.split('-')?.map(str => str.trim()) || [
    undefined,
    undefined,
  ];
  const vgmSubmittedByClient =
    request?.vgmSubmittedBy === VGMSubmittedBy.CLIENT
      ? request.client
      : request.assignedUser?.alphacomClientId &&
        ((await fetchClientByAlphacomId(request.assignedUser?.alphacomClientId)).data() as Client);
  const itinerary = getItineraryFromSchedule(request.schedule);
  const portOfLoading = itinerary?.portOfLoading;

  return flow(
    set('Agreement', request.agreementNo),
    set('BL-No', request.blNumber),
    set('INTBL', request.intBlNumber),
    set('BkgAgentContact', request.assignedUser?.alphacomId),
    set('BkgAgentContactEml', request.assignedUser?.emailAddress),
    set('BkgAgentContactTxt', `${request.assignedUser?.firstName} ${request.assignedUser?.lastName}`),
    set('BkgCreateTimeStamp', new Date()),
    set('BkgTouchTimeStamp', new Date()),
    set('TimeStamp', new Date()),
    set('CarrierID', request.carrier?.name),
    set('Category', BookingCategory.Export),
    set('Version', BookingVersion.long),
    set('VesselCode', portOfLoading?.VoyageInfo?.VesselCode),
    set('Vessel', portOfLoading?.VoyageInfo?.VesselName),
    set('Voyage', portOfLoading?.VoyageInfo?.VoyageNr),
    set('requestId', request.id),
    set('ForwAdrCity', request.client?.city),
    set('ForwAdrId', request.client?.id),
    set('ForwAdrName', request.client?.name),
    set('StatClient', request.statClient?.id),
    set('StatClientRef', request.agreementNo),
    set('ForwPersID', request.createdBy?.alphacomId),
    set('ForwarderPersTxt', `${request.createdBy?.firstName} ${request.createdBy?.lastName}`),
    set(
      'FreightDetails',
      set(
        'FreightDetail',
        request.freightDetails?.map(detail => ({
          ...detail,
          Unit: detail.Unit ? getRelevantUnit(detail.Unit.trim().toUpperCase()) : undefined,
          ChgCode: chargeCodes ? chargeCodes.find(code => code.text === detail.Txt)?.chargeCodeId : undefined,
        })),
      )({}),
    ),
    set('leadingCurrency', request.leadingCurrency),
    set('ERP-CarrierID', erpCarrierId),
    set('ERP-ServiceID', erpServiceId),
    set('Carrier-BkgRef', null),
    set('Cust-BkgRef', request.customerReference),
    set(
      'PlaceOfRecieptISO',
      itinerary?.placeOfReceipt ? itinerary?.placeOfReceipt?.Port.ID : itinerary?.portOfLoading?.Port.ID,
    ),
    set(
      'PlaceOfRecieptName',
      itinerary?.placeOfReceipt
        ? itinerary?.placeOfReceipt?.Port.HarbourName
        : itinerary?.portOfLoading?.Port.HarbourName,
    ),
    set(
      'PlaceOfReceiptETS',
      itinerary?.placeOfReceipt ? itinerary?.placeOfReceipt?.DepartureDate : itinerary?.portOfLoading?.DepartureDate,
    ),
    set('POL', itinerary?.portOfLoading?.Port.ID),
    set('POLName', itinerary?.portOfLoading?.Port.HarbourName),
    set('POLETS', itinerary?.portOfLoading?.DepartureDate),
    set('POD', itinerary?.portOfDischarge?.Port.ID),
    set('PODName', itinerary?.portOfDischarge?.Port.HarbourName),
    set('PODETS', itinerary?.portOfDischarge?.DepartureDate), //TODO check if ETA or ETS is needed
    set(
      'FinalDestinationISO',
      itinerary?.placeOfDelivery ? itinerary?.placeOfDelivery?.Port.ID : itinerary?.portOfDischarge?.Port.ID,
    ),
    set(
      'FinalDestinationName',
      itinerary?.placeOfDelivery
        ? itinerary?.placeOfDelivery?.Port.HarbourName
        : itinerary?.portOfDischarge?.Port.HarbourName,
    ),
    set(
      'FinalDestinationETA',
      itinerary?.placeOfDelivery ? itinerary?.placeOfDelivery?.ArrivalDate : itinerary?.portOfDischarge?.ArrivalDate,
    ),
    set(
      'Remarks',
      flow(set('Remark'))(
        request.specialRemarks?.map((remark, index) =>
          flow(set('RemarkSeq', `${index}`), renameField('id', 'RemarkType'), renameField('text', 'RemarkTxt'))(remark),
        ),
      )({}),
    ),
    set(
      'PortTerms',
      flow(
        set('RelevantPort', 'POL'), //For export this is always POL, for import it is always POD
        set('LinerPortAgent', portOfLoading?.Port.PortAgent),
        set('FOBDeliveryBy', portOfLoading?.Port.PortAgent.split('<br/>')[0]),
        set('VGMSubmByID', vgmSubmittedByClient && vgmSubmittedByClient?.id),
        set('VGMSubmByTxt', vgmSubmittedByClient && getRepresentationFromClient(vgmSubmittedByClient)),
        set(
          'Closings',
          set(
            'Closing',
            request.schedule?.Deadlines.map(closing => {
              const [date, time] = closing.Time?.split('-')?.map(str => str.trim()) || [undefined, undefined];
              return {
                ClosingType: closing.Typ,
                ClosingDate: date,
                ClosingTime: time,
                ClosingTxt: ['DELIVERY', 'FCL'].includes(closing.Typ)
                  ? null
                  : '(TO BE SUBMITTED BEFORE CONTAINER DELIVERY AT THE TERMINAL)',
              };
            }),
          )({}),
        ),
      )({}),
    ),
    set(
      'CargoDetails',
      flow(
        set(
          'CargoDetail',
          request.containers?.map((value, index) => {
            const tariffs = getTariffs(value);
            return {
              ItemNo: index + 1,
              CtrQuantity: value.quantity,
              CtypID: value.containerType?.id,
              CommodityID: value.commodityType?.id,
              CommodityTXT: value.commodityType?.name,
              CtrWeight: `${value.weight?.toFixed(2)} KGS`,
              'VGM-PIN': value.vgmPin,
              DemDetTariff: value.demDetTariffs && value.demDetTariffs.length > 0 ? value.demDetTariffs[0].id : null,
              StorageTariff:
                value.storageTariffs && value.storageTariffs.length > 0 ? value.storageTariffs[0].id : null,
              PluginTariff: value.pluginTariffs && value.pluginTariffs.length > 0 ? value.pluginTariffs[0].id : null,
              Temperature: value.temperature
                ? `${value.temperature > 0 ? '+' + value.temperature : value.temperature}° Celsius`
                : null,
              Dehumidification: value.humidity ? `${value.humidity}%` : null,
              Ventilation: value.ventilation,
              LocRefs: {
                LocRef: [
                  {
                    LocType: 'DEPOT',
                    LocID: value.pickupLocation?.id,
                    LocRef: value.pickupReference,
                    LocDate: value.pickupDate && formatDateSafe(value.pickupDate, 'dd.mm.yyyy'),
                  },
                  {
                    LocType: 'TERMINAL',
                    LocID: request.schedule?.OriginInfo.Port.TerminalID || null,
                    LocRef: value.deliveryReference,
                    LocDate: null,
                  },
                ],
              },
              IMCO: value.imo?.length > 0 ? 'Yes' : 'No',
              IMCOs: {
                IMCO: value.imo?.map((imco: any) => ({
                  IMOClass: imco?.IMOClass,
                  UNNumber: imco?.UNNumber,
                  PackingNumber: imco?.PGNumber,
                  FlashPoint: null,
                })),
              },
              Overdimension: value.oog?.length > 0 ? 'Yes' : 'No',
              Overwidth: value.oog?.length > 0 ? (value.oog[0] as any).diffWidth : null,
              Overheight: value.oog?.length > 0 ? (value.oog[0] as any).diffHeight : null,
              Overlength: value.oog?.length > 0 ? (value.oog[0] as any).diffLength : null,
              Overweight: value.oog?.length > 0 ? (value.oog[0] as any).diffWeight : null,
              EmptySlots: value.oog?.length > 0 ? (value.oog[0] as any).displacement : null,
              CtrMaxCaseDim: value.oog
                ? {
                    MaxWidth: value.oog?.length > 0 ? (value.oog[0] as any).width : null,
                    MaxHeight: value.oog?.length > 0 ? (value.oog[0] as any).height : null,
                    MaxLength: value.oog?.length > 0 ? (value.oog[0] as any).length : null,
                    MaxWeight: value.oog?.length > 0 ? (value.oog[0] as any).weight : null,
                  }
                : null,
              CtrOverDimRemark: value.oog ? 'OUT-OF-GAUGE' : null,
              BBQuantity: null,
              BBWeight: null,
              BBVolume: null,
              CargoDetailRemarks: null,
              Stock: null,
              DropOffRef: null,
              Equipment: {
                EquipmentDetail: request.containers?.map(ctg => ({
                  ContainerNumber: ctg.containerNumbers ? ctg.containerNumbers : 'NOT AVAILABLE',
                  CtypID: value.containerType?.id,
                  PickUpDate: ctg.pickupDate && formatDateSafe(ctg.pickupDate, 'dd.mm.yyyy'),
                  GateInDate: null,
                  GateOutDate: null,
                  DropOffDate: null,
                  PINNr: null,
                  CtrTariffs: {
                    CtrTariff: tariffs,
                  },
                })),
              },
            };
          }),
        ),
      )({}),
    ),
  )({});
};

const renameField = (oldName: string, newName: string, transformationFunction?: any) => (value: any) =>
  get(oldName)(value)
    ? flow(renameKey(oldName, newName, transformationFunction), omit([oldName]))(value)
    : (() => {
        delete value[oldName];
        return value;
      })();

const renameKey = (oldName: string, newName: string, transformationFunction?: any) => (value: { [key: string]: any }) =>
  transformationFunction
    ? set(newName, transformationFunction(get(oldName)(value)))(value)
    : set(newName, get(oldName)(value))(value);

export const getVoyageInfo = (schedule?: RouteSearchResult) => {
  if (!schedule) return undefined;
  if (hasPlaceOfReceipt(schedule)) {
    const [d] = getPortOfLoadingFromIntermediatePorts(schedule);
    return d?.VoyageInfo;
  }

  return schedule.OriginInfo.VoyageInfo;
};
