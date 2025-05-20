import WeeklyPayment, {
  WeeklyPaymentApiAction,
  WeeklyPaymentPlatformStatus,
  WeeklyPaymentStatus,
  WeeklyPaymentStatusLabel,
} from '../../../model/WeeklyPayment';
import {
  Box,
  Button,
  Container,
  ExpansionPanel,
  ExpansionPanelActions,
  ExpansionPanelDetails,
  ExpansionPanelSummary,
  IconButton,
  Menu,
  MenuItem,
  Tooltip,
  Typography,
} from '@material-ui/core';
import { formatDateSafe } from '../../../utilities/formattingHelpers';
import currencyFormatter from '../../../utilities/currencyFormatter';
import DocumentListItem from '../checklist/DocumentListItem';
import {
  ActivityChangeType,
  ActivityLogUserData,
  DocumentValue,
  DocumentValueStatus,
} from '../checklist/ChecklistItemModel';
import React, { useCallback, useContext, useMemo } from 'react';
import { Booking } from '../../../model/Booking';
import { editRestriction } from '../checklist/CheckList';
import { addActivityItem } from '../checklist/ActivityLogContainer';
import { createActivityObject } from '../checklist/ChecklistItemRow';
import firebase from '../../../firebase';
import UserRecordContext from '../../../contexts/UserRecordContext';
import { useSnackbar } from 'notistack';
import useAccountingDocuments from '../../../hooks/useAccountingDocuments';
import ChartsCircularProgress from '../../dashboard/ChartsCircularProgress';
import DropZone from '../../DropZone';
import { addDays } from 'date-fns';
import { DebitCredit } from '../../../model/Payment';
import useUser from '../../../hooks/useUser';
import { GlobalContext } from '../../../store/GlobalStore';
import PanToolIcon from '@material-ui/icons/PanTool';
import SettingsBackupRestoreIcon from '@material-ui/icons/SettingsBackupRestore';
import SpellcheckIcon from '@material-ui/icons/Spellcheck';
import PaymentApprovalButton from './PaymentApprovalButton';
import TaskManualResolveButton from '../../TaskManualResolveButton';
import Task, { TaskType } from '../../../model/Task';
import MarkThatSomethingIsWrongButton from '../../MarkThatSomethingIsWrongButton';
import { tryGetErrorMessage } from '../../../utilities/errorHelper';

const addAccountingDocument = (file: DocumentValue, paymentReference: string) => {
  return firebase
    .firestore()
    .collection('weeklyPayment')
    .doc(paymentReference)
    .collection('accounting-documents')
    .doc()
    .set(file);
};

const deleteAccountingDocument = (file: DocumentValue, paymentReference: string) => {
  return firebase
    .firestore()
    .collection('weeklyPayment')
    .doc(paymentReference)
    .collection('accounting-documents')
    .doc(file.id)
    .delete();
};

export const changeAccountingDocument = (file: DocumentValue, paymentReference: string) => {
  return firebase
    .firestore()
    .collection('weeklyPayment')
    .doc(paymentReference)
    .collection('accounting-documents')
    .doc(file.id)
    .update(file);
};

export const changeWeeklyPayment = (referenceId: string, updatedPayment: any) => {
  return firebase
    .firestore()
    .collection('weeklyPayment')
    .doc(referenceId)
    .set(updatedPayment, { merge: true });
};

interface PostponeMenuProps {
  anchorEl: any;
  handleClose: () => void;
  changePayment: (offset: number) => void;
}

const PostponeMenu: React.FC<PostponeMenuProps> = ({ anchorEl, handleClose, changePayment }) => {
  return (
    <Menu
      id="accounting-postpone-menu"
      anchorEl={anchorEl}
      keepMounted
      open={Boolean(anchorEl)}
      onClose={handleClose}
    >
      <MenuItem onClick={() => changePayment(-14)}>2 Weeks Earlier</MenuItem>
      <MenuItem onClick={() => changePayment(-7)}>1 Week Earlier</MenuItem>
      <MenuItem onClick={() => changePayment(7)}>1 Week Later</MenuItem>
      <MenuItem onClick={() => changePayment(14)}>2 Weeks Later</MenuItem>
    </Menu>
  );
};

const postponePayment = async (offset: number, user: any, weeklyPayment: WeeklyPayment) => {
  try {
    const token = await user.getIdToken();
    console.log('Postponing');
    const response = await fetch(`${import.meta.env.VITE_REACT_APP_API_URL}/weeklyPayment`, {
      method: 'POST',
      mode: 'cors',
      cache: 'no-cache',
      credentials: 'include',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify([
        {
          action: WeeklyPaymentApiAction.MOVE,
          recId: weeklyPayment.recId,
          reference: weeklyPayment.reference,
          payDate: addDays(weeklyPayment.payDate, offset),
        },
      ]),
    });

    if (response.ok) {
      const body = await response.json();
      console.log('Body', body);
    } else {
      const body = await response.json();
      console.error(`Failed to request`, response, body);
    }
  } catch (e) {
    console.error('Failed to perform request', e);
  } finally {
  }
};
const getPaymentDisplayedStatus = (payment: WeeklyPayment) => {
  return payment.platformStatus
    ? payment.platformStatus === WeeklyPaymentPlatformStatus.ON_HOLD
      ? payment.status === WeeklyPaymentStatus.IN_PROGRESS
        ? WeeklyPaymentStatusLabel[payment.platformStatus as WeeklyPaymentPlatformStatus]
        : WeeklyPaymentStatusLabel[payment.status as WeeklyPaymentStatus]
      : payment.platformStatus === WeeklyPaymentPlatformStatus.CLEARED
        ? payment.status !== WeeklyPaymentStatus.PAID
          ? WeeklyPaymentStatusLabel[payment.platformStatus as WeeklyPaymentPlatformStatus]
          : WeeklyPaymentStatusLabel[payment.status as WeeklyPaymentStatus]
        : WeeklyPaymentStatusLabel[payment.platformStatus as WeeklyPaymentPlatformStatus]
    : WeeklyPaymentStatusLabel[payment.status as WeeklyPaymentStatus];
};
const AccountingWeeklyPayment = ({
  payment,
  booking,
  updateComponent,
  tasks,
}: AccountingWeeklyPaymentProps) => {
  const userRecord = useContext(UserRecordContext);
  const accountingDocuments = useAccountingDocuments(payment.reference);
  const { enqueueSnackbar } = useSnackbar();
  const [anchorEl, setAnchorEl] = React.useState(null);
  const [user] = useUser();
  const [, dispatch] = useContext(GlobalContext);
  const clearInvoiceTask = useMemo(() => {
    return tasks && tasks.length > 0
      ? tasks.find(
          task => task.type === TaskType.CLEAR_INVOICE && task.id.includes(payment.reference),
        )
      : undefined;
  }, [payment.reference, tasks]);
  const handleClickMenu = (event: any) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const storageBasePath = useMemo((): string => {
    return [
      'booking-documents',
      'clients',
      booking.ForwAdrId,
      'bookings',
      booking.id,
      'accounting-documents',
    ].join('/');
  }, [booking]);

  const getActivityLogUserData = useCallback(
    (): ActivityLogUserData =>
      ({
        firstName: userRecord?.firstName,
        lastName: userRecord?.lastName,
        alphacomClientId: userRecord?.alphacomClientId,
        alphacomId: userRecord?.alphacomId,
        emailAddress: userRecord?.emailAddress,
      }) as ActivityLogUserData,
    [userRecord],
  );

  const handleAddFile = useCallback(
    (addedFiles: DocumentValue[]) => {
      return Promise.all(addedFiles.map(file => addAccountingDocument(file, payment.reference)))
        .then(_ => {
          updateComponent?.();
          return addActivityItem(
            booking!.id,
            createActivityObject({
              changeType: ActivityChangeType.ADD_FILE,
              by: getActivityLogUserData(),
              documents: addedFiles,
              isAccountingActivity: true,
            }),
          );
        })
        .catch(error => console.error('Error saving new document list', error));
    },
    [booking, getActivityLogUserData, payment.reference, updateComponent],
  );

  const handleDeleteFile = useCallback(
    (deletedFile: DocumentValue) => {
      return Promise.resolve(deleteAccountingDocument(deletedFile, payment.reference))
        .then(_ => {
          updateComponent?.();
          return addActivityItem(
            booking!.id,
            createActivityObject({
              changeType: ActivityChangeType.DELETE_FILE,
              by: getActivityLogUserData(),
              documents: [deletedFile],
              isAccountingActivity: true,
            }),
          );
        })
        .catch(error => console.error('Error during document deletion', error));
    },
    [booking, getActivityLogUserData, payment.reference, updateComponent],
  );

  const storeAccountingActivity = useCallback(
    (accountingActivityHandler: () => Promise<void>) => {
      accountingActivityHandler()
        .then(_ => {
          updateComponent?.();
          enqueueSnackbar(<Typography color="inherit">Saved changes!</Typography>, {
            variant: 'success',
            autoHideDuration: 1500,
          });
        })
        .catch(error => {
          console.error('error storing activity', error);
          enqueueSnackbar(<Typography color="inherit"> {tryGetErrorMessage(error)}!</Typography>, {
            variant: 'error',
            autoHideDuration: 3000,
          });
        });
    },
    [enqueueSnackbar, updateComponent],
  );

  const handleDocumentStatusChange = useCallback(
    (item: DocumentValue, status: DocumentValueStatus, dontCreateActivity?: boolean) => {
      if (item.status && !editRestriction(item.status!.at as Date)) {
        return enqueueSnackbar(
          <Typography color="inherit">
            {`Failed to edit item - You cant change status after ${import.meta.env.VITE_EDIT_RESTRICTION_TIME} from last change!`}
          </Typography>,
          {
            variant: 'error',
            autoHideDuration: 1000,
          },
        );
      }
      const newItem: DocumentValue = { ...item, status: status };

      storeAccountingActivity(() =>
        changeAccountingDocument(newItem, payment.reference).then(_ => {
          updateComponent?.();
          if (!dontCreateActivity) {
            return addActivityItem(
              booking!.id,
              createActivityObject({
                changeType: ActivityChangeType.DOCUMENT_STATUS_CHANGED,
                by: getActivityLogUserData(),
                documents: [newItem],
                isAccountingActivity: true,
              }),
            );
          }
        }),
      );
    },
    [
      storeAccountingActivity,
      enqueueSnackbar,
      payment.reference,
      updateComponent,
      booking,
      getActivityLogUserData,
    ],
  );

  const handleChangePayDate = useCallback(
    (offset: number) => {
      const dateBeforeChange = payment.payDate;
      dispatch({ type: 'START_GLOBAL_LOADING' });
      return Promise.resolve(postponePayment(offset, user, payment))
        .then(_ => {
          handleClose();
          storeAccountingActivity(() =>
            addActivityItem(
              booking!.id,
              createActivityObject({
                changeType: ActivityChangeType.POSTPONE_PAYMENT,
                by: getActivityLogUserData(),
                isAccountingActivity: true,
                paymentReference: payment.reference,
                paymentActivityData: {
                  dateBeforeChange: dateBeforeChange,
                  dateAfterChange: addDays(dateBeforeChange, offset),
                },
              }),
            ),
          );
        })
        .finally(() => {
          dispatch({ type: 'STOP_GLOBAL_LOADING' });
          updateComponent?.();
          handleClose();
        });
    },
    [
      payment,
      dispatch,
      user,
      storeAccountingActivity,
      booking,
      getActivityLogUserData,
      updateComponent,
    ],
  );

  const handleChangePaymentPlatformStatus = useCallback(
    (newStatus: WeeklyPaymentPlatformStatus | null) => {
      dispatch({ type: 'START_GLOBAL_LOADING' });
      if (payment.id)
        return Promise.resolve(changeWeeklyPayment(payment.id, { platformStatus: newStatus }))
          .then(_ => {
            storeAccountingActivity(() =>
              addActivityItem(
                booking!.id,
                createActivityObject({
                  changeType:
                    newStatus === WeeklyPaymentPlatformStatus.ON_HOLD
                      ? ActivityChangeType.PUT_ON_HOLD_PAYMENT
                      : ActivityChangeType.REVERT_PUT_ON_HOLD_PAYMENT,
                  by: getActivityLogUserData(),
                  isAccountingActivity: true,
                  paymentReference: payment.reference,
                }),
              ),
            );
          })
          .finally(() => {
            updateComponent?.();
            dispatch({ type: 'STOP_GLOBAL_LOADING' });
          });
      else return undefined;
    },
    [
      booking,
      dispatch,
      getActivityLogUserData,
      payment.id,
      payment.reference,
      storeAccountingActivity,
      updateComponent,
    ],
  );

  return (
    <ExpansionPanel key={payment.reference} style={{ margin: 4 }}>
      <ExpansionPanelSummary style={{ backgroundColor: 'rgba(198,238,241,0.24)', display: 'flex' }}>
        <Box flex={1} display="flex" flexDirection="row" justifyContent="space-between">
          <Typography variant={'h5'}>{formatDateSafe(payment.payDate, 'd. MMMM yyyy.')}</Typography>
          <Typography variant={'h5'}>
            {'Amount: '.concat(
              currencyFormatter(payment.currency)(payment.amount),
              payment.debitCredit === DebitCredit.CREDIT ? '-' : '',
            )}
          </Typography>
          {payment.approvedByOCR && (
            <Tooltip title={'Approved by OCR'}>
              <SpellcheckIcon htmlColor={'rgba(0,200,81)'} />
            </Tooltip>
          )}
          <Typography
            variant={'h5'}
            style={{
              fontWeight: 700,
              color:
                payment.status === WeeklyPaymentStatus.PAID
                  ? 'rgba(0,200,81)'
                  : payment.platformStatus === WeeklyPaymentPlatformStatus.CLEARED
                    ? '#b186df'
                    : payment.platformStatus === WeeklyPaymentPlatformStatus.ON_HOLD &&
                        payment.status === WeeklyPaymentStatus.IN_PROGRESS
                      ? '#df6b00'
                      : '#000',
            }}
          >
            {getPaymentDisplayedStatus(payment)}
          </Typography>
        </Box>
      </ExpansionPanelSummary>
      <ExpansionPanelDetails>
        <Box display="flex" flex={1} flexDirection="column" px={0} style={{ listStyle: 'none' }}>
          <Box p={2}>
            <Typography variant={'h5'}>{'Reference Id: ' + payment.reference}</Typography>
            <Typography variant={'h5'}>{'Type: ' + payment.debitCredit}</Typography>
          </Box>
          {!accountingDocuments ? (
            <Container>
              <ChartsCircularProgress />
            </Container>
          ) : (
            accountingDocuments.map(item => (
              <DocumentListItem
                key={item.id}
                item={item}
                booking={booking}
                storageBasePath={storageBasePath}
                changeStatus={(
                  item: DocumentValue,
                  status: DocumentValueStatus,
                  dontCreateActivity?: boolean,
                ) => handleDocumentStatusChange(item, status, dontCreateActivity)}
                deleteFile={(item: DocumentValue) => handleDeleteFile(item)}
                internal={true}
                isAccountingDocument={true}
                markAsFinal={() => {}}
                otherDocuments={accountingDocuments}
                selectForComparison={() => {}}
                payment={payment}
              />
            ))
          )}
          {payment.status === WeeklyPaymentStatus.IN_PROGRESS && (
            <DropZone
              storageBasePath={storageBasePath}
              internal={false}
              onUpload={values => storeAccountingActivity(() => handleAddFile(values))}
              onDelete={() => {}}
            />
          )}
        </Box>
      </ExpansionPanelDetails>
      <ExpansionPanelActions>
        {payment.status === WeeklyPaymentStatus.IN_PROGRESS && (
          <React.Fragment>
            {payment && payment.status === WeeklyPaymentStatus.IN_PROGRESS && (
              <MarkThatSomethingIsWrongButton payment={payment} booking={booking} />
            )}
            {payment.status === WeeklyPaymentStatus.IN_PROGRESS ? (
              payment.platformStatus !== WeeklyPaymentPlatformStatus.ON_HOLD ? (
                <Tooltip title={'Put this weekly payment on hold'}>
                  <IconButton
                    onClick={() =>
                      handleChangePaymentPlatformStatus(WeeklyPaymentPlatformStatus.ON_HOLD)
                    }
                  >
                    <PanToolIcon />
                  </IconButton>
                </Tooltip>
              ) : (
                <Tooltip title={'Revert to in progress'}>
                  <IconButton onClick={() => handleChangePaymentPlatformStatus(null)}>
                    <SettingsBackupRestoreIcon />
                  </IconButton>
                </Tooltip>
              )
            ) : null}
            <Button onClick={handleClickMenu} color="primary" variant="outlined">
              Postpone Payment
            </Button>
          </React.Fragment>
        )}
        {payment.status === WeeklyPaymentStatus.BLOCKED &&
          clearInvoiceTask &&
          clearInvoiceTask.show && (
            <Tooltip
              title={
                clearInvoiceTask.resolved ? 'Revert clearing of this invoice' : 'Clear this invoice'
              }
            >
              <span>
                <TaskManualResolveButton task={clearInvoiceTask} />
              </span>
            </Tooltip>
          )}
        <PaymentApprovalButton
          payment={payment}
          booking={booking}
          accountingDocuments={accountingDocuments}
          updateComponent={updateComponent}
        />
      </ExpansionPanelActions>
      {anchorEl && (
        <PostponeMenu
          anchorEl={anchorEl}
          handleClose={handleClose}
          changePayment={handleChangePayDate}
        />
      )}
    </ExpansionPanel>
  );
};

interface AccountingWeeklyPaymentProps {
  payment: WeeklyPayment;
  booking: Booking;
  updateComponent?: () => void;
  tasks?: Task[];
}

export default AccountingWeeklyPayment;
