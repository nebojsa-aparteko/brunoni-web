import React, { ChangeEvent, useCallback, useContext, useEffect, useLayoutEffect, useMemo, useState } from 'react';
import {
  Box,
  Button,
  CircularProgress,
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
import UnarchiveIcon from '@material-ui/icons/Unarchive';
import Page from '../bookings/Page';
import { BookingRequest, BookingRequestStatusCode, BookingRequestStatusText } from '../../model/BookingRequest';
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
import { ActivityChangeType } from '../bookings/checklist/ChecklistItemModel';
import useUser from '../../hooks/useUser';
import { createActivityObject } from '../bookings/checklist/ChecklistItemRow';
import { useBookingRequestContext } from '../../providers/BookingRequestProvider';
import omitEmptyDeep, { removeEmptyDeep } from '../../utilities/omitEmptyDeep';
import { flow, isEqual, isNil, keys, map, omit, pick, set, update } from 'lodash/fp';
import useModal from '../../hooks/useModal';
import ConfirmLeadingCurrencyDialog from './ConfirmLeadingCurrencyDialog';
import Mousetrap from 'mousetrap';
import useGlobalAppState from '../../hooks/useGlobalAppState';
import MissingFields from '../onlineBooking/MissingFields';
import useClientUsers from '../../hooks/useClientUsers';
import useActivityLogUserData from '../../hooks/useActivityLogUserData';
import { RouteSearchResult } from '../../model/route-search/RouteSearchResults';
import { getPortOfLoadingFromIntermediatePorts, hasPlaceOfReceipt } from './BookingRequestSummary';
import { DropDownMenuWithItems } from '../DropdownMenu';
import LogoImage from '../LogoImage';
import BookNowButton from '../BookNowButton';
import EditButton from '../EditButton';
import { addActivityItem } from '../../utilities/activityHelper';
import createAlphacomRepresentationOfBooking from '../../utilities/createAlphacomRepresentationOfBooking';
import { ChangedField } from '../bookings/checklist/ActivityModel';
import useActivities from '../../hooks/useActivities';
import PinnedActivities from '../bookings/PinnedActivities';
import ChargeCodes from '../../contexts/ChargeCodes';
import TagsList from '../tags/TagsList';
import { Tag, TagCategory } from '../../model/Tag';
import useFirestoreCollection from '../../hooks/useFirestoreCollection';
import { diff } from 'deep-object-diff';
import { ItemsOptions } from '../../model/Checklist';
import PanToolIcon from '@material-ui/icons/PanTool';
import { getActivityLogUserData } from '../../utilities/getActivityLogUserData';
import SettingsBackupRestoreIcon from '@material-ui/icons/SettingsBackupRestore';
import { useHistory } from 'react-router';

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
        flow(
          set('updatedAt', new Date()),
          update(
            'containers',
            map((value: any) =>
              flow(
                update('imo', val => (val?.[0] ? val[1] : null)),
                update('oog', val => (val?.[0] ? val[1] : null)),
              )(value),
            ),
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
        disabled={!(selectedAgent && selectedClient)}
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

function timeout(delay: number) {
  return new Promise(res => setTimeout(res, delay));
}

async function urlExists(url: string) {
  const result = await fetch(url, { method: 'HEAD' });
  return result.ok;
}

const setChecked = async (bookingReqId: string, itemType: string, checked: boolean) => {
  await setChecklistItem(bookingReqId, itemType, checked);
};

const setChecklistItem = async (bookingReqId: string, itemType: string, checked: boolean) => {
  await firebase
    .firestore()
    .collection('bookings-requests')
    .doc(bookingReqId)
    .collection('checklist')
    .doc(itemType)
    .set({ checked }, { merge: true });
};

const setBookingRequestField = async (bookingReqId: string, newFieldValue: any) => {
  await firebase
    .firestore()
    .collection('bookings-requests')
    .doc(bookingReqId)
    .set(newFieldValue, { merge: true });
};

const BookingRequestView: React.FC<Props> = ({ bookingRequest }) => {
  const [user, userRecord, isAdmin] = useUser();
  const classes = useStyles();
  const chargeCodes = useContext(ChargeCodes);
  const { isOpen, openModal, closeModal } = useModal();
  const {
    isOpen: isOpenAssignmentModal,
    closeModal: closeAssignmentModal,
    openModal: openAssignmentModal,
  } = useModal();
  const [printRequested, setPrintRequested] = useState(false);
  const [isPrintWithCost, setPrintWithCost] = useState(false);
  const [bookingRequestState, setBookingRequestState, editing, setEditing] = useBookingRequestContext();

  const showWarningMessage = !!bookingRequest.showWarningMessage;

  const [agreementNumber, setAgreementNumber] = useState<string>(
    bookingRequestState?.agreementNo || bookingRequest.agreementNo || '',
  );
  const [, dispatch] = useGlobalAppState();
  const history = useHistory();
  const getActivityLogUserData = useActivityLogUserData();

  const tags = useFirestoreCollection(
    'bookings-requests',
    useCallback(
      query => {
        const queryByCategory = isAdmin ? query : query.where('category', '==', TagCategory.BOOKING_REQUEST);
        return queryByCategory.orderBy('createdAt', 'asc');
      },
      [isAdmin],
    ),
    bookingRequest.id,
    'tags-booking-request',
  )?.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
  })) as Tag[];

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
        bookingRequest.statusCode >= BookingRequestStatusCode.CONFIRMED ||
        (BookingRequestStatusText.REQUESTED !== bookingRequest.statusText && !isDashboardUser(userRecord))
      ),
    [bookingRequest, userRecord],
  );

  useEffect(() => {
    !editing && setBookingRequestState(bookingRequest);
    !editing && setAgreementNumber(bookingRequest.agreementNo || '');
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
    if (br) {
      updateBookingRequest({ ...br, agreementNo: agreementNumber })
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
  }, [bookingRequestState, bookingRequest?.schedule, agreementNumber]);

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

  const onBookingCreate = useCallback(
    (bookingId: string) =>
      firebase
        .firestore()
        .collection('bookings-requests')
        .doc(bookingRequest?.id)
        .update(
          'bookingId',
          bookingId,
          'statusCode',
          BookingRequestStatusCode.CONFIRMED,
          'statusText',
          BookingRequestStatusText.CONFIRMED,
        ),
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
        dispatch({ type: 'START_GLOBAL_LOADING' });
        const token = await user.getIdToken();
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
          const body = await response.json();
          if (body.FileID) {
            await onBookingCreate(body.FileID);
            await timeout(1000);
            if (await urlExists(`/bookings/${body.FileID}`)) {
              history.push(`/bookings/${body.FileID}`);
            } else {
              await timeout(2000);
              if (await urlExists(`/bookings/${body.FileID}`)) {
                history.push(`/bookings/${body.FileID}`);
              } else {
                dispatch({
                  type: 'SHOW_SUCCESS_SNACKBAR',
                  duration: 5000,
                  message:
                    'Booking is still being created. Click on the booking number displayed in the request to view it.',
                });
              }
            }
          } else {
            console.log('No booking ID received, unable to redirect');
          }
        } else {
          const body = await response.json();
          console.error(`Failed to request`, response, body);
          dispatch({
            type: 'SHOW_ERROR_SNACKBAR',
            message: 'Failed to request booking',
          });
        }
      } catch (e) {
        console.error('Failed to perform request', e);
      } finally {
        dispatch({ type: 'STOP_GLOBAL_LOADING' });
      }
    } else {
      return openModal();
    }
  }, [bookingRequestState, user, chargeCodes]);

  const handleChangeAgreementNumberText = useCallback((event: ChangeEvent<HTMLInputElement>) => {
    setAgreementNumber(event.target.value);
  }, []);

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
          changeType: !bookingRequest.hold
            ? ActivityChangeType.PUT_ON_HOLD_BOOKING_REQ
            : ActivityChangeType.REVERT_PUT_ON_HOLD_BOOKING_REQ,
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
      const obj = removeEmptyDeep({
        fieldName: key,
        oldVal: oldVal[key],
        newVal: newVal[key],
      });
      changedFields.push(obj as ChangedField);
    });
    return changedFields;
  };

  const checkForUpdatesInArray = async (obj: any[]) => {
    //Commodity type
    const hasCommodityType = obj.every(k => !isNil(k.commodityType));
    await setChecked(bookingRequest.id!, ItemsOptions.COMMODITY_CHECK, hasCommodityType);
    //Weight Change
    const hasWeight = obj.every(k => !isNil(k.weight));
    await setChecked(bookingRequest.id!, ItemsOptions.WEIGHT_CHECK, hasWeight);
    //Weight Change
    const hasPickUpAndDeliveryRef = obj.every(k => !isNil(k.pickupReference) && !isNil(k.deliveryReference));
    await setChecked(bookingRequest.id!, ItemsOptions.PICKUP_AND_DELIVERY_REF, hasPickUpAndDeliveryRef);
    // Terminal Change
    const hasTerminal = obj.every(k => !isNil(k.pickupLocation));
    await setChecked(bookingRequest.id!, ItemsOptions.TERMINAL_CHECK, hasTerminal);
  };

  const autoCheckList = async (oldObject: BookingRequest, newObject: BookingRequest) => {
    if (newObject.containers) {
      //containers
      await checkForUpdatesInArray(newObject.containers);
    }
  };

  const handleFieldsEditActivity = async () => {
    //todo. without freight details for now?... Because it change at beggining
    const oldObject = diff(omit('updatedAt')(bookingRequestState), omit('updatedAt')(bookingRequest));
    const newObject = diff(omit('updatedAt')(bookingRequest), omit('updatedAt')(bookingRequestState));

    if (isAdmin) await autoCheckList(bookingRequest, bookingRequestState);
    // console.log('oldObject')
    // console.log(oldObject)
    // console.log('new Object')
    // console.log(newObject)
    const changedKeys = keys(newObject);

    if (changedKeys.includes('freightDetails'))
      await setBookingRequestField(bookingRequest.id!, { showWarningMessage: false });

    const changedFields = createChangedFieldsObject(changedKeys, oldObject, newObject);
    // console.log('changedFields')
    // console.log(changedFields)
    const activityObject = createActivityObject({
      changeType: ActivityChangeType.EDITED,
      by: getActivityLogUserData,
      changedFields,
    });
    // console.log('activityObject')
    // console.log(activityObject)
    if (changedKeys.length > 0) {
      bookingRequest.id && (await addActivityItem('bookings-requests', bookingRequest.id, activityObject));
    }
  };

  return (
    <Grid container direction="row" spacing={2} justify="center" alignItems="flex-start" className={classes.body}>
      {/*<Button onClick={() => createAlphacomReq(bookingRequest, []).then(result => console.log(result))}>Test</Button>*/}
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
          {isAdmin &&
            (tags ? (
              <TagsList tags={tags || []} tagCategory={TagCategory.BOOKING_REQUEST} documentId={bookingRequest.id} />
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
                    defaultValue={''}
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
              <Box display={'flex'} alignItems={'center'}>
                {!editing && isDashboardUser(userRecord) && (
                  <BookNowButton
                    bookNow={bookNow}
                    disabled={bookingRequest.statusCode >= BookingRequestStatusCode.CONFIRMED}
                  />
                )}
                <Box className={classes.actions} displayPrint="none">
                  <EditButton
                    handleCancelEditing={handleCancelEditing}
                    handleSave={handleSave}
                    disabled={!canEdit}
                    editing={editing}
                    startEditing={() => setEditing(true)}
                  />
                  {isAdmin && (
                    <IconButton size="small" aria-label="Watch" component="span" onClick={openAssignmentModal}>
                      <SupervisedUserCircleIcon />
                    </IconButton>
                  )}

                  {isAdmin && (
                    <DropDownMenuWithItems
                      items={[
                        {
                          onClick: () => storeActivity(archiveHandler),
                          icon: bookingRequest.archived ? <UnarchiveIcon /> : <ArchiveIcon />,
                          label: bookingRequest.archived ? 'Restore' : 'Archive',
                        },
                        {
                          onClick: () => storeActivity(holdHandler),
                          icon: bookingRequest.hold ? <SettingsBackupRestoreIcon /> : <PanToolIcon />,
                          label: bookingRequest.hold ? 'Unhold' : 'Hold',
                        },
                        {
                          onClick: () => {
                            setPrintWithCost(false);
                            setPrintRequested(true);
                          },
                          icon: <PrintIcon />,
                          label: 'Print without costs',
                        },
                        {
                          onClick: () => {
                            setPrintWithCost(true);
                            setPrintRequested(true);
                          },
                          icon: <PrintIcon />,
                          label: 'Print with cost',
                        },
                      ]}
                    />
                  )}
                </Box>
              </Box>
            </Box>
            <Grid item xs={12}>
              <BookingRequestViewMainContent
                isPrintWithCost={isPrintWithCost}
                showWarningMessage={showWarningMessage}
              />
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
// const createAlphacomReq = async (bookingRequest: BookingRequest, filteredChargeCodes: any) => {
//   console.log(bookingRequest, 'BR');
//   console.log(await createAlphacomRepresentationOfBooking(bookingRequest, filteredChargeCodes));
//   // throw new Error('Function not implemented.');
// };
