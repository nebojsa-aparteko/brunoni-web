import WeeklyPayment, {
  WeeklyPaymentApiAction,
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
  Menu,
  MenuItem,
  Typography,
} from '@material-ui/core';
import { formatDateSafe } from '../../../utilities/formattingHelpers';
import currencyFormatter from '../../../utilities/currencyFormatter';
import DocumentListItem from '../checklist/DocumentListItem';
import {
  ActivityChangeType,
  ActivityLogUserData,
  ChecklistItemValueDocumentStatusType,
  DocumentValue,
  DocumentValueStatus,
} from '../checklist/ChecklistItemModel';
import React, { useCallback, useContext, useMemo, useState } from 'react';
import { Booking } from '../../../model/Booking';
import { editRestriction } from '../checklist/CheckList';
import { addActivityItem } from '../checklist/ActivityLogContainer';
import { createActivityObject } from '../checklist/ChecklistItemRow';
import firebase from '../../../firebase';
import UserRecordContext from '../../../contexts/UserRecordContext';
import { useSnackbar } from 'notistack';
import useAccountingDocuments from '../../../hooks/useAccountingDocuments';
import ChartsCircularProgress from '../../dashboard/ChartsCircularProgress';
import { showCrispChat } from '../../../index';
import ConfirmationDialog from '../../ConfirmationDialog';
import DropZone from '../../DropZone';
import { addDays } from 'date-fns';
import { DebitCredit } from '../../../model/Payment';
import useUser from '../../../hooks/useUser';
import { GlobalContext } from '../../../store/GlobalStore';
import { ActivityLogProvider } from '../checklist/ActivityLogContext';

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

const changeAccountingDocument = (file: DocumentValue, paymentReference: string) => {
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
    <Menu id="accounting-postpone-menu" anchorEl={anchorEl} keepMounted open={Boolean(anchorEl)} onClose={handleClose}>
      <MenuItem onClick={() => changePayment(-7)}>1 Week Earlier</MenuItem>
      <MenuItem onClick={() => changePayment(7)}>1 Week Later</MenuItem>
    </Menu>
  );
};

const postponePayment = async (offset: number, user: any, weeklyPayment: WeeklyPayment) => {
  try {
    const token = await user.getIdToken();
    console.log('Postponing');
    const response = await fetch(`${process.env.REACT_APP_API_URL}/weeklyPayment`, {
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

const approveWeeklyPayment = async (user: any, weeklyPayment: WeeklyPayment) => {
  try {
    const token = await user.getIdToken();

    const response = await fetch(`${process.env.REACT_APP_API_URL}/weeklyPayment`, {
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
          action:
            weeklyPayment.status === WeeklyPaymentStatus.BLOCKED
              ? WeeklyPaymentApiAction.UNBLOCK
              : WeeklyPaymentApiAction.BLOCK,
          recId: weeklyPayment.recId,
          reference: weeklyPayment.reference,
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
  }
};

const AccountingWeeklyPayment = ({ payment, booking, updateComponent }: AccountingWeeklyPaymentProps) => {
  const userRecord = useContext(UserRecordContext);
  const accountingDocuments = useAccountingDocuments(payment.reference);
  const { enqueueSnackbar } = useSnackbar();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [anchorEl, setAnchorEl] = React.useState(null);
  const [user] = useUser();
  const [, dispatch] = useContext(GlobalContext);

  const handleClickMenu = (event: any) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleDialogClose = useCallback(() => {
    showCrispChat(true);
    setIsDialogOpen(false);
  }, [setIsDialogOpen]);

  const handleDialogOpen = useCallback(() => {
    showCrispChat(false);
    setIsDialogOpen(true);
  }, [setIsDialogOpen]);

  const storageBasePath = useMemo((): string => {
    return ['booking-documents', 'clients', booking.ForwAdrId, 'bookings', booking.id, 'accounting-documents'].join(
      '/',
    );
  }, [booking]);

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

  const handleAddFile = useCallback(
    (addedFiles: DocumentValue[]) => {
      return Promise.all(addedFiles.map(file => addAccountingDocument(file, payment.reference)))
        .then(_ =>
          addActivityItem(
            booking!.id,
            createActivityObject({
              changeType: ActivityChangeType.ADD_FILE,
              by: getActivityLogUserData(),
              documents: addedFiles,
              isAccountingActivity: true,
            }),
          ),
        )
        .catch(error => console.error('Error saving new document list', error));
    },
    [booking, getActivityLogUserData, payment.reference],
  );

  const handleDeleteFile = useCallback(
    (deletedFile: DocumentValue) => {
      return Promise.resolve(deleteAccountingDocument(deletedFile, payment.reference))
        .then(_ =>
          addActivityItem(
            booking!.id,
            createActivityObject({
              changeType: ActivityChangeType.DELETE_FILE,
              by: getActivityLogUserData(),
              documents: [deletedFile],
              isAccountingActivity: true,
            }),
          ),
        )
        .catch(error => console.error('Error during document deletion', error));
    },
    [booking, getActivityLogUserData, payment.reference],
  );

  const storeAccountingActivity = useCallback(
    (accountingActivityHandler: () => Promise<void>) => {
      accountingActivityHandler()
        .then(_ => {
          enqueueSnackbar(<Typography color="inherit">Saved changes!</Typography>, {
            variant: 'success',
            autoHideDuration: 1500,
          });
        })
        .catch(error => {
          console.error('error storing activity', error);
          enqueueSnackbar(<Typography color="inherit"> {error.message}!</Typography>, {
            variant: 'error',
            autoHideDuration: 3000,
          });
        });
    },
    [enqueueSnackbar],
  );

  const handleDocumentStatusChange = useCallback(
    (item: DocumentValue, status: DocumentValueStatus) => {
      if (item.status && !editRestriction(item.status!.at as Date)) {
        return enqueueSnackbar(
          <Typography color="inherit">
            {`Failed to edit item - You cant change status after ${process.env.EDIT_RESTRICTION_TIME} from last change!`}
          </Typography>,
          {
            variant: 'error',
            autoHideDuration: 1000,
          },
        );
      }
      const newItem: DocumentValue = { ...item, status: status };

      storeAccountingActivity(() =>
        changeAccountingDocument(newItem, payment.reference).then(_ =>
          addActivityItem(
            booking!.id,
            createActivityObject({
              changeType: ActivityChangeType.DOCUMENT_STATUS_CHANGED,
              by: getActivityLogUserData(),
              documents: [newItem],
              isAccountingActivity: true,
            }),
          ),
        ),
      );
    },
    [payment.reference, booking, enqueueSnackbar, getActivityLogUserData, storeAccountingActivity],
  );

  const handleChangePayDate = useCallback(
    (offset: number) => {
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
              }),
            ),
          );
        })
        .finally(() => {
          dispatch({ type: 'STOP_GLOBAL_LOADING' });
          if (updateComponent) updateComponent();
          handleClose();
        });
    },
    [payment, booking, getActivityLogUserData, storeAccountingActivity, user],
  );

  const handleChangePaymentStatus = useCallback(() => {
    const activityType: ActivityChangeType =
      payment.status === WeeklyPaymentStatus.BLOCKED
        ? ActivityChangeType.REVERT_PAYMENT_APPROVAL
        : ActivityChangeType.APPROVE_PAYMENT;
    dispatch({ type: 'START_GLOBAL_LOADING' });
    return approveWeeklyPayment(user, payment)
      .then(_ => {
        handleDialogClose();
        storeAccountingActivity(() =>
          addActivityItem(
            booking!.id,
            createActivityObject({
              changeType: activityType,
              by: getActivityLogUserData(),
              isAccountingActivity: true,
              paymentReference: payment.reference,
            }),
          ),
        );
      })
      .finally(() => {
        dispatch({ type: 'STOP_GLOBAL_LOADING' });
        if (updateComponent) updateComponent();
      });
  }, [payment, booking, getActivityLogUserData, storeAccountingActivity, handleDialogClose, user]);

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
          <Typography
            variant={'h5'}
            style={{
              fontWeight: 700,
              color:
                payment.status === WeeklyPaymentStatus.PAID
                  ? 'rgba(0,200,81)'
                  : payment.status === WeeklyPaymentStatus.CLEARED
                  ? '#b186df'
                  : '#000',
            }}
          >
            {WeeklyPaymentStatusLabel[payment.status as WeeklyPaymentStatus]}
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
            <ActivityLogProvider>
              {accountingDocuments.map(item => (
                <DocumentListItem
                  key={item.id}
                  item={item}
                  booking={booking}
                  storageBasePath={storageBasePath}
                  changeStatus={(item: DocumentValue, status: DocumentValueStatus) =>
                    handleDocumentStatusChange(item, status)
                  }
                  deleteFile={(item: DocumentValue) => handleDeleteFile(item)}
                  internal={true}
                  isAccountingDocument={true}
                  markAsFinal={() => {}}
                  comparableDocuments={[]}
                  selectForComparison={() => {}}
                  paymentStatus={payment.status}
                />
              ))}
            </ActivityLogProvider>
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
            <Button onClick={handleClickMenu} color="primary" variant="outlined">
              Postpone Payment
            </Button>
            <Button
              onClick={handleDialogOpen}
              color="primary"
              variant="contained"
              disabled={
                !(
                  payment.status === WeeklyPaymentStatus.IN_PROGRESS &&
                  (accountingDocuments && accountingDocuments.length > 0
                    ? accountingDocuments.every(
                        document => document.status?.type === ChecklistItemValueDocumentStatusType.APPROVED,
                      )
                    : payment.carrier !== 'Hamburg Süd')
                )
              }
            >
              Approve Payment
            </Button>
          </React.Fragment>
        )}
        {payment.status === WeeklyPaymentStatus.BLOCKED && (
          <Button onClick={handleDialogOpen} color="primary" variant="outlined">
            Revert Approval
          </Button>
        )}
      </ExpansionPanelActions>
      {anchorEl && <PostponeMenu anchorEl={anchorEl} handleClose={handleClose} changePayment={handleChangePayDate} />}
      {isDialogOpen && (
        <ConfirmationDialog
          isOpen={isDialogOpen}
          description="If you confirm this action, that will block this file! Are you sure you want to approve payment on this file?"
          label={
            payment.status === WeeklyPaymentStatus.IN_PROGRESS
              ? 'Please confirm payment approval'
              : 'Please confirm approved reversal'
          }
          handleConfirm={handleChangePaymentStatus}
          handleClose={handleDialogClose}
        />
      )}
    </ExpansionPanel>
  );
};

interface AccountingWeeklyPaymentProps {
  payment: WeeklyPayment;
  booking: Booking;
  updateComponent?: () => void;
}

export default AccountingWeeklyPayment;
