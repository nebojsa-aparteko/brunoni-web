import React, { ChangeEvent, useCallback, useContext, useEffect, useLayoutEffect, useMemo, useState } from 'react';
import {
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
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
import VisibilityOffIcon from '@material-ui/icons/VisibilityOff';
import VisibilityIcon from '@material-ui/icons/Visibility';
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
import { ActivityChangeType, ActivityLogUserData } from '../bookings/checklist/ChecklistItemModel';
import useUser from '../../hooks/useUser';
import { createActivityObject } from '../bookings/checklist/ChecklistItemRow';
import { useBookingRequestContext } from '../../providers/BookingRequestProvider';
import { removeEmptyDeep } from '../../utilities/omitEmptyDeep';
import { flow, isNil, keys, map, omit, pick, set, update } from 'lodash/fp';
import useModal from '../../hooks/useModal';
import ConfirmLeadingCurrencyDialog from './ConfirmLeadingCurrencyDialog';
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
import { TagCategory } from '../../model/Tag';
import { diff } from 'deep-object-diff';
import { ItemsOptions } from '../../model/Checklist';
import PanToolIcon from '@material-ui/icons/PanTool';
import { getActivityLogUserData } from '../../utilities/getActivityLogUserData';
import SettingsBackupRestoreIcon from '@material-ui/icons/SettingsBackupRestore';
import CommodityTypes from '../../contexts/CommodityTypes';
import Tags from '../../contexts/Tags';
import Container from '../../model/Container';
import WatchersChipMultiInput from '../watchers/WatchersChipMultiInput';

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
    border: '2px solid #00b0ff',
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
  button: {
    '@media print': {
      display: 'none',
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
  dialogActions: {
    display: 'flex',
    justifyContent: 'space-evenly',
    alignItems: 'center',
  },
  hidePrint: {
    '@media print': {
      display: 'none',
    },
  },
  showPrint: {
    '@media print': {
      display: 'initial',
    },
  },
}));

interface AgentAssignmentDialogProps {
  bookingRequest: BookingRequest;
  isOpen: boolean;
  handleClose: () => void;
}

export const updateBookingRequest = (bookingRequest: BookingRequest) => {
  if (bookingRequest.id) {
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

const changeAssignedAgent = async (id: string, user: UserRecordMin | null) =>
  await firebase
    .firestore()
    .collection('bookings-requests')
    .doc(id)
    .set(
      {
        assignedUser: user ? pick(UserRecordMinProperties)(user) : null,
      },
      { merge: true },
    );
const changeAssignedClient = async (id: string, user: UserRecord | null) =>
  await firebase
    .firestore()
    .collection('bookings-requests')
    .doc(id)
    .set(
      {
        createdBy: user ? pick(UserRecordMinProperties)(user) : null,
      },
      { merge: true },
    );

const changeWatchers = async (id: string, watchers: UserRecordMin[]) =>
  await firebase
    .firestore()
    .collection('bookings-requests')
    .doc(id)
    .set(
      {
        watchers,
      },
      {
        merge: true,
      },
    );

export const changeBookingRequestUnreadStatus = (id: string, isUnread: boolean) =>
  firebase
    .firestore()
    .collection('bookings-requests')
    .doc(id)
    .set(
      {
        isUnread: isUnread,
      },
      { merge: true },
    );
const AgentAssignmentDialog: React.FC<AgentAssignmentDialogProps> = ({ bookingRequest, isOpen, handleClose }) => {
  const classes = useStyles();
  const userRecord = useUser()[1];
  const assignableUsers = useAdminUsers(CUSTOMER_FACING_ROLES);
  const assignableCustomers = useClientUsers(bookingRequest.client?.id);
  const [selectedAgent, setSelectedAgent] = useState<UserRecordMin | undefined | null>(bookingRequest.assignedUser);
  const [selectedClient, setSelectedClient] = useState<UserRecord | undefined>(bookingRequest.createdBy);
  const [selectedWatchers, setSelectedWatchers] = useState<UserRecordMin[]>(bookingRequest.watchers || []);
  const [showUnreadContent, setShowUnreadContent] = useState<boolean>(false);
  const [, dispatch] = useGlobalAppState();

  const handleChangeClient = async () => {
    try {
      if (bookingRequest.id && bookingRequest.createdBy?.emailAddress !== selectedClient?.emailAddress) {
        await changeAssignedClient(bookingRequest.id, selectedClient || null);
        await addActivityItem(
          'bookings-requests',
          bookingRequest.id,
          createActivityObject({
            changeType: selectedClient ? ActivityChangeType.ASSIGNED_CLIENT : ActivityChangeType.UNASSIGNED_CLIENT,
            by: getActivityLogUserData(userRecord),
            addedUsers: selectedClient
              ? [getActivityLogUserData(selectedClient)]
              : [getActivityLogUserData(bookingRequest.createdBy)],
          }),
        );
      }
    } catch (e) {
      console.error(e);
      return dispatch({ type: 'SHOW_ERROR_SNACKBAR', message: 'Failed to set Client!' });
    }
  };

  const handleChangeAgent = async () => {
    try {
      if (bookingRequest.id) {
        ((!selectedAgent && bookingRequest.assignedUser) ||
          (selectedAgent && !bookingRequest.assignedUser) ||
          (selectedAgent && bookingRequest.assignedUser?.emailAddress !== selectedAgent.emailAddress)) &&
          changeAssignedAgent(bookingRequest.id, selectedAgent || null).then(async () => {
            //TODO create activity types for removing the selected agent and client
            bookingRequest.id &&
              (await addActivityItem(
                'bookings-requests',
                bookingRequest.id,
                createActivityObject({
                  changeType: selectedAgent ? ActivityChangeType.ASSIGNED_AGENT : ActivityChangeType.UNASSIGNED_AGENT,
                  by: getActivityLogUserData(userRecord),
                  addedUsers: selectedAgent
                    ? [getActivityLogUserData(selectedAgent)]
                    : [getActivityLogUserData(bookingRequest.assignedUser)],
                }),
              ));
          });
      }
    } catch (e) {
      console.error(e);
      return dispatch({ type: 'SHOW_ERROR_SNACKBAR', message: 'Failed to set Agent!' });
    }
  };

  const handleChangeWatchers = async () => {
    try {
      const sameWatchers =
        (bookingRequest.watchers &&
          selectedWatchers.length === bookingRequest.watchers.length &&
          bookingRequest.watchers.every(
            (watcher, index) => watcher.alphacomId === selectedWatchers[index].alphacomId,
          )) ||
        false;

      if (bookingRequest.id && !sameWatchers) {
        await changeWatchers(bookingRequest.id, selectedWatchers);
      }
    } catch (e) {
      console.error(e);
      return dispatch({ type: 'SHOW_ERROR_SNACKBAR', message: 'Failed to set Watchers!' });
    }
  };

  const handleMarkAsUnread = () => {
    dispatch({ type: 'START_GLOBAL_LOADING' });
    try {
      if (bookingRequest.id) {
        changeBookingRequestUnreadStatus(bookingRequest.id, true)
          .then(() => handleClose())
          .then(() => dispatch({ type: 'STOP_GLOBAL_LOADING' }));
      }
    } catch (e) {
      console.log(e);
      dispatch({ type: 'STOP_GLOBAL_LOADING' });
      return dispatch({ type: 'SHOW_ERROR_SNACKBAR', message: 'Failed to mark request as unread!' });
    }
  };

  return (
    <Dialog open={isOpen} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle disableTypography>
        <Typography variant="h4">{showUnreadContent ? 'Mark booking request as unread' : 'Watchers'}</Typography>
        <IconButton onClick={handleClose} className={classes.closeModal}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      {showUnreadContent ? (
        <DialogActions className={classes.dialogActions}>
          <Button onClick={handleClose} color="primary" variant="outlined">
            No
          </Button>
          <Button onClick={handleMarkAsUnread} color="primary" variant="contained">
            Yes
          </Button>
        </DialogActions>
      ) : (
        <React.Fragment>
          <DialogContent className={classes.dialogContent}>
            <React.Fragment>
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
              <Box my={1}>
                <WatchersChipMultiInput
                  options={assignableUsers || []}
                  values={selectedWatchers}
                  fixedValues={bookingRequest.assignedUser ? [bookingRequest.assignedUser] : []}
                  onChange={(event, watchers) => setSelectedWatchers(watchers as UserRecord[])}
                />
              </Box>
            </React.Fragment>
          </DialogContent>
          <Button
            onClick={async event => {
              event.stopPropagation();
              dispatch({ type: 'START_GLOBAL_LOADING' });
              await handleChangeAgent();
              await handleChangeClient();
              await handleChangeWatchers();
              dispatch({ type: 'STOP_GLOBAL_LOADING' });
              !selectedAgent && bookingRequest.assignedUser && !bookingRequest.isUnread && setShowUnreadContent(true);
              !(!selectedAgent && bookingRequest.assignedUser && !bookingRequest.isUnread) && handleClose();
            }}
            variant="contained"
            className={classes.saveBtn}
            color="primary"
          >
            Save
          </Button>
        </React.Fragment>
      )}
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

const checkForUpdatesInArray = async (obj: Container[], bookingRequest: BookingRequest) => {
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
    await checkForUpdatesInArray(newObject.containers, oldObject);
  }
};

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

export const handleFieldsEditActivity = async (
  bookingRequest: BookingRequest,
  bookingRequestState: BookingRequest,
  isAdmin: boolean,
  getActivityLogUserData: ActivityLogUserData,
) => {
  const omitFields = ['updatedAt', 'checklistCheckedCount', 'showWarningMessage'];
  const oldObject = diff(omit(omitFields)(bookingRequestState), omit(omitFields)(bookingRequest));
  const newObject = diff(omit(omitFields)(bookingRequest), omit(omitFields)(bookingRequestState));
  // we disabled this line of code because Nenad wanted to define this auto check feature better https://trello.com/c/uIjgPCSr
  // if (isAdmin) await autoCheckList(bookingRequest, bookingRequestState);
  const changedKeys = keys(newObject);

  if (changedKeys.includes('freightDetails') && bookingRequestState.showWarningMessage !== false)
    await setBookingRequestField(bookingRequest.id!, { showWarningMessage: false });

  const changedFields = createChangedFieldsObject(changedKeys, oldObject, newObject);

  const activityObject = createActivityObject({
    changeType: ActivityChangeType.EDITED,
    by: getActivityLogUserData,
    changedFields,
  });
  if (changedKeys.length > 0) {
    bookingRequest.id && (await addActivityItem('bookings-requests', bookingRequest.id, activityObject));
  }
};

const onArchiveClick = (bookingRequest: BookingRequest) =>
  firebase
    .firestore()
    .collection('bookings-requests')
    .doc(bookingRequest?.id)
    .update(
      'statusCode',
      bookingRequest.statusCode === BookingRequestStatusCode.ARCHIVED
        ? bookingRequest.assignedUser
          ? BookingRequestStatusCode.IN_PROGRESS
          : BookingRequestStatusCode.REQUESTED
        : BookingRequestStatusCode.ARCHIVED,
      'statusText',
      bookingRequest.statusCode === BookingRequestStatusCode.ARCHIVED
        ? bookingRequest.assignedUser
          ? BookingRequestStatusText.IN_PROGRESS
          : BookingRequestStatusText.REQUESTED
        : BookingRequestStatusText.ARCHIVED,
    );

const onHoldClick = (bookingRequest: BookingRequest) =>
  firebase
    .firestore()
    .collection('bookings-requests')
    .doc(bookingRequest?.id)
    .update('hold', !bookingRequest.hold);

const onBookingCreate = (bookingRequest: BookingRequest, bookingId: string) =>
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
    );

export const getBookingData = async (bookingId: string) =>
  (
    await firebase
      .firestore()
      .collection('bookings')
      .doc(bookingId)
      .get()
  ).data();

const BookingRequestView: React.FC<Props> = ({ bookingRequest }) => {
  const [user, userRecord, isAdmin] = useUser();
  const classes = useStyles();
  const chargeCodes = useContext(ChargeCodes);
  const commodityTypes = useContext(CommodityTypes);
  const availableTags = useContext(Tags);
  const { isOpen, openModal, closeModal } = useModal();
  const [isBookNowAutomaticallyDisabled, setIsBookNowAutomaticallyDisabled] = useState<boolean>(true);
  const [isBookNowDisabled, setIsBookNowDisabled] = useState<boolean>(
    bookingRequest.statusCode >= BookingRequestStatusCode.CONFIRMED ||
      isBookNowAutomaticallyDisabled ||
      !bookingRequest.assignedUser,
  );

  useEffect(() => {
    setIsBookNowDisabled(
      bookingRequest.statusCode >= BookingRequestStatusCode.CONFIRMED ||
        isBookNowAutomaticallyDisabled ||
        !bookingRequest.assignedUser,
    );
  }, [bookingRequest.statusCode, isBookNowAutomaticallyDisabled, bookingRequest.assignedUser]);

  const {
    isOpen: isOpenAssignmentModal,
    closeModal: closeAssignmentModal,
    openModal: openAssignmentModal,
  } = useModal();
  const [printRequested, setPrintRequested] = useState(false);
  const [isPrintWithCost, setPrintWithCost] = useState(false);
  const [tags, setTags] = useState(
    availableTags &&
      availableTags.filter(tag => bookingRequest.assignedTags && bookingRequest.assignedTags.includes(tag.id)),
  );
  const [bookingRequestState, setBookingRequestState, editing] = useBookingRequestContext();

  const showWarningMessage = !!bookingRequest.showWarningMessage;

  const [, dispatch] = useGlobalAppState();
  const getActivityLogUserData = useActivityLogUserData();

  useEffect(() => {
    !editing && setBookingRequestState(bookingRequest);
  }, [bookingRequest]);

  useEffect(
    () =>
      setTags(
        availableTags &&
          availableTags.filter(tag => bookingRequest.assignedTags && bookingRequest.assignedTags.includes(tag.id)),
      ),
    [availableTags, bookingRequest.assignedTags],
  );

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

  const bookNow = useCallback(async () => {
    // if freight has ocean freight create leading currency
    // if not choose between eur and usd
    const freight = bookingRequestState?.freightDetails?.filter(f => ['Oceanfreight', 'Seafreight'].includes(f.Txt));

    if (bookingRequestState.leadingCurrency || (freight && freight.length > 0)) {
      const f = freight?.pop();
      if (!bookingRequestState.leadingCurrency && !f?.Currency) return openModal();
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
          body: JSON.stringify(
            await createAlphacomRepresentationOfBooking(bookingRequestState!, chargeCodes, commodityTypes),
          ),
        });

        if (response.ok) {
          const body = await response.json();
          if (body.FileID) {
            await timeout(3000);
            let bookingData = await getBookingData(body.FileID);
            if (bookingData) {
              await onBookingCreate(bookingRequest, body.FileID);
              const win: Window | null = window.open(`/bookings/${body.FileID}`, '_blank');
              win && win.focus();
            } else {
              await timeout(10000);
              bookingData = await getBookingData(body.FileID);
              if (bookingData) {
                await onBookingCreate(bookingRequest, body.FileID);
                const win: Window | null = window.open(`/bookings/${body.FileID}`, '_blank');
                win && win.focus();
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
            dispatch({
              type: 'SHOW_ERROR_SNACKBAR',
              message: 'Unable to create booking',
            });
            console.error('No booking ID received, unable to redirect');
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

  const handleChangeAgreementNumberText = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      setBookingRequestState(prev => ({
        ...prev,
        agreementNo: event.target.value,
      }));
    },
    [setBookingRequestState],
  );

  const archiveHandler = () =>
    onArchiveClick(bookingRequest).then(() =>
      addActivityItem(
        'bookings-requests',
        bookingRequest.id!,
        createActivityObject({
          changeType:
            bookingRequest.statusCode !== BookingRequestStatusCode.ARCHIVED
              ? ActivityChangeType.ARCHIVED
              : ActivityChangeType.UNARCHIVED,
          by: getActivityLogUserData,
        }),
      ),
    );
  const holdHandler = () =>
    onHoldClick(bookingRequest).then(() =>
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

  const getCorrectBackRoute = () => {
    if (bookingRequest.statusCode <= BookingRequestStatusCode.IN_PROGRESS && !bookingRequest.hold) {
      return '/bookings?tab=requests';
    } else if (bookingRequest.statusCode <= BookingRequestStatusCode.IN_PROGRESS && bookingRequest.hold) {
      return '/bookings?tab=on-hold';
    } else if (bookingRequest.statusCode >= BookingRequestStatusCode.CONFIRMED) {
      return '/bookings?tab=archived-requests';
    } else {
      return '/bookings?tab=requests';
    }
  };

  return (
    <Grid container direction="row" spacing={2} justify="center" alignItems="flex-start" className={classes.body}>
      <Grid item md={8} xs={12}>
        <Page title={getBookingRequestTitle(bookingRequest)}>
          <MissingFields
            bookingRequest={bookingRequest}
            setIsBookNowButtonDisabled={value => setIsBookNowAutomaticallyDisabled(value)}
          />
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

            <Box
              className={classes.actionBar}
              mb={2}
              display="flex"
              alignItems="flex-start"
              justifyContent="space-between"
            >
              <Box
                className={classes.actionBar}
                display="flex"
                flexDirection="row"
                alignItems="flex-start"
                justifyContent="space-between"
              >
                <QuoteNav
                  backTo={getCorrectBackRoute()}
                  title={`Booking Request - ${getBookingRequestTitle(bookingRequest)}`}
                  subtitle={`File No. ${bookingRequest.id}`}
                />
                {editing && isDashboardUser(userRecord) ? (
                  <TextField
                    defaultValue={''}
                    label="Agreement No."
                    margin="dense"
                    variant="outlined"
                    value={bookingRequestState.agreementNo}
                    onChange={handleChangeAgreementNumberText}
                    autoFocus
                    className={classes.agreementInput}
                  />
                ) : (
                  <Typography variant={'h5'} style={{ paddingLeft: '20px' }}>
                    {bookingRequestState.agreementNo && bookingRequestState.agreementNo !== ''
                      ? 'Agreement No. ' + bookingRequestState.agreementNo
                      : 'Agreement No. [To be assigned]'}
                  </Typography>
                )}
              </Box>
              <Box flex="1" />
              <Box display={'flex'} alignItems={'center'} className={classes.button}>
                {!editing && isDashboardUser(userRecord) && (
                  <BookNowButton bookNow={bookNow} disabled={isBookNowDisabled} />
                )}
                <Box className={classes.actions} displayPrint="none">
                  <EditButton bookingRequest={bookingRequest} />
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
                          icon:
                            bookingRequest.statusCode === BookingRequestStatusCode.ARCHIVED ? (
                              <UnarchiveIcon />
                            ) : (
                              <ArchiveIcon />
                            ),
                          label:
                            bookingRequest.statusCode === BookingRequestStatusCode.ARCHIVED ? 'Restore' : 'Archive',
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
                        {
                          onClick: () => {
                            dispatch({ type: 'START_GLOBAL_LOADING' });
                            bookingRequest.id &&
                              changeBookingRequestUnreadStatus(bookingRequest.id, !bookingRequest.isUnread)
                                .then(() =>
                                  dispatch({
                                    type: 'SHOW_SUCCESS_SNACKBAR',
                                    duration: 5000,
                                    message: bookingRequest.isUnread
                                      ? 'Booking request marked as read'
                                      : 'Booking request marked as unread',
                                  }),
                                )
                                .catch(() =>
                                  dispatch({
                                    type: 'SHOW_ERROR_SNACKBAR',
                                    duration: 5000,
                                    message: bookingRequest.isUnread
                                      ? 'Marking as read failed'
                                      : 'Marking as unread failed',
                                  }),
                                )
                                .finally(() => dispatch({ type: 'STOP_GLOBAL_LOADING' }));
                          },
                          icon: bookingRequest.isUnread ? <VisibilityIcon /> : <VisibilityOffIcon />,
                          label: bookingRequest.isUnread ? 'Mark as read' : 'Mark as unread',
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
//TODO should be removed or changed to take the vessel and voyage from Port of Loading
export const getVoyageInfo = (schedule?: RouteSearchResult | null) => {
  if (!schedule) return undefined;
  if (hasPlaceOfReceipt(schedule)) {
    const [d] = getPortOfLoadingFromIntermediatePorts(schedule);
    return d?.VoyageInfo;
  }

  return schedule.OriginInfo.VoyageInfo;
};

export const getVoyageInfoFromBookingRequest = (bookingRequest?: BookingRequest | null) => {
  if (!bookingRequest) return undefined;
  return bookingRequest.itinerary?.portOfLoading.VoyageInfo;
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
