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
  createStyles,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  ExpansionPanel,
  ExpansionPanelActions,
  ExpansionPanelDetails,
  ExpansionPanelSummary,
  IconButton,
  makeStyles,
  Menu,
  MenuItem,
  Theme,
  Tooltip,
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
import CloseIcon from '@material-ui/icons/Close';
import CommentInput from '../../CommentInput';
import { ActivityType } from '../checklist/ActivityModel';
import { RejectionInput } from '../documentApproval/RejectionModal';
import ActingAs from '../../../contexts/ActingAs';
import PanToolIcon from '@material-ui/icons/PanTool';
import SettingsBackupRestoreIcon from '@material-ui/icons/SettingsBackupRestore';
import { TeamType } from '../../../model/Teams';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    closeModal: {
      position: 'absolute',
      top: '5px',
      right: '12px',
      width: '47px',
      height: '47px',
    },
    dialogActions: {
      display: 'flex',
      justifyContent: 'space-evenly',
      alignItems: 'center',
    },
    content: {
      margin: theme.spacing(1),
    },
  }),
);

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

interface RevertApprovalDialogProps {
  isOpen: boolean;
  payment: WeeklyPayment;
  booking: Booking;
  handleChangePaymentStatus: (rejectionInput?: RejectionInput) => void;
  handleClose: () => void;
}

const RevertApprovalDialog: React.FC<RevertApprovalDialogProps> = ({
  isOpen,
  payment,
  booking,
  handleChangePaymentStatus,
  handleClose,
}) => {
  const classes = useStyles();
  const [rejectionInput, setRejectionInput] = useState<RejectionInput | undefined>(undefined);

  const onRejectionInputChange = useCallback((input: RejectionInput) => {
    setRejectionInput(input);
  }, []);

  const onReject = useCallback(() => {
    handleChangePaymentStatus(rejectionInput);
  }, [rejectionInput, handleChangePaymentStatus]);

  return (
    <Dialog open={isOpen} onClose={handleClose} maxWidth="sm" fullWidth>
      <Box>
        <DialogTitle disableTypography>
          <Typography variant="h4">
            {payment.status === WeeklyPaymentStatus.IN_PROGRESS
              ? 'Please confirm payment approval'
              : 'Please confirm approvement reversal'}
          </Typography>
          <IconButton onClick={handleClose} className={classes.closeModal}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          <Typography className={classes.content}>
            {payment.status === WeeklyPaymentStatus.IN_PROGRESS
              ? 'If you confirm this action, that will block this file! Are you sure you want to approve payment on this file?'
              : 'Enter the reason for reversal:'}
          </Typography>
          <CommentInput
            booking={booking}
            onInputChange={rejectionInput => onRejectionInputChange(rejectionInput)}
            mentionTeamsType={TeamType.ACCOUNTING}
          />
        </DialogContent>
        <Divider />

        <DialogActions className={classes.dialogActions}>
          <Button onClick={handleClose} color="primary" variant="outlined">
            Cancel
          </Button>
          <Button onClick={onReject} color="primary" variant="contained">
            Confirm
          </Button>
        </DialogActions>
      </Box>
    </Dialog>
  );
};

const AccountingWeeklyPayment = ({ payment, booking, updateComponent }: AccountingWeeklyPaymentProps) => {
  const userRecord = useContext(UserRecordContext);
  const accountingDocuments = useAccountingDocuments(payment.reference);
  const { enqueueSnackbar } = useSnackbar();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [anchorEl, setAnchorEl] = React.useState(null);
  const [user] = useUser();
  const actingAs = useContext(ActingAs)[0];
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
    [booking, getActivityLogUserData, payment.reference],
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
    [booking, getActivityLogUserData, payment.reference],
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
        changeAccountingDocument(newItem, payment.reference).then(_ => {
          updateComponent?.();
          return addActivityItem(
            booking!.id,
            createActivityObject({
              changeType: ActivityChangeType.DOCUMENT_STATUS_CHANGED,
              by: getActivityLogUserData(),
              documents: [newItem],
              isAccountingActivity: true,
            }),
          );
        }),
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
          updateComponent?.();
          handleClose();
        });
    },
    [payment, booking, getActivityLogUserData, storeAccountingActivity, user],
  );

  const handleChangePaymentStatus = useCallback(
    (rejectionInput?: RejectionInput) => {
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
                type: rejectionInput ? ActivityType.ACTIVITY_WITH_COMMENT : ActivityType.ACTIVITY,
                changeType: activityType,
                by: getActivityLogUserData(),
                comment: rejectionInput?.messagePlain,
                internal: !actingAs,
                mentions: rejectionInput?.mentions,
                isAccountingActivity: true,
                paymentReference: payment.reference,
              }),
            ),
          );
        })
        .finally(() => {
          dispatch({ type: 'STOP_GLOBAL_LOADING' });
          updateComponent?.();
        });
    },
    [
      payment,
      booking,
      getActivityLogUserData,
      storeAccountingActivity,
      handleDialogClose,
      user,
      actingAs,
      dispatch,
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
                      ? ActivityChangeType.PUT_ON_HOLD
                      : ActivityChangeType.REVERT_PUT_ON_HOLD,
                  by: getActivityLogUserData(),
                  isAccountingActivity: true,
                  paymentReference: payment.reference,
                }),
              ),
            );
          })
          .finally(() => {
            dispatch({ type: 'STOP_GLOBAL_LOADING' });
            updateComponent?.();
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
          <Typography
            variant={'h5'}
            style={{
              fontWeight: 700,
              color:
                payment.status === WeeklyPaymentStatus.PAID
                  ? 'rgba(0,200,81)'
                  : payment.platformStatus === WeeklyPaymentPlatformStatus.CLEARED
                  ? '#b186df'
                  : payment.platformStatus === WeeklyPaymentPlatformStatus.ON_HOLD
                  ? '#df6b00'
                  : '#000',
            }}
          >
            {payment.platformStatus
              ? WeeklyPaymentStatusLabel[payment.platformStatus as WeeklyPaymentPlatformStatus]
              : WeeklyPaymentStatusLabel[payment.status as WeeklyPaymentStatus]}
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
            {payment.status === WeeklyPaymentStatus.IN_PROGRESS ? (
              payment.platformStatus !== WeeklyPaymentPlatformStatus.ON_HOLD ? (
                <Tooltip title={'Put this weekly payment on hold'}>
                  <IconButton onClick={() => handleChangePaymentPlatformStatus(WeeklyPaymentPlatformStatus.ON_HOLD)}>
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
            <Button
              onClick={handleDialogOpen}
              color="primary"
              variant="contained"
              disabled={
                payment.platformStatus === WeeklyPaymentPlatformStatus.ON_HOLD ||
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
        {((payment.platformStatus && payment.platformStatus === WeeklyPaymentPlatformStatus.CLEARED) ||
          payment.status === WeeklyPaymentStatus.BLOCKED) && (
          <Button onClick={handleDialogOpen} color="primary" variant="outlined">
            Revert Approval
          </Button>
        )}
      </ExpansionPanelActions>
      {anchorEl && <PostponeMenu anchorEl={anchorEl} handleClose={handleClose} changePayment={handleChangePayDate} />}
      {payment.status === WeeklyPaymentStatus.IN_PROGRESS ? (
        <ConfirmationDialog
          isOpen={isDialogOpen}
          description="If you confirm this action, that will block this file! Are you sure you want to approve payment on this file?"
          label="Please confirm payment approval"
          handleConfirm={handleChangePaymentStatus}
          handleClose={handleDialogClose}
        />
      ) : (payment.platformStatus && payment.platformStatus === WeeklyPaymentPlatformStatus.CLEARED) ||
        payment.status === WeeklyPaymentStatus.BLOCKED ? (
        <RevertApprovalDialog
          isOpen={isDialogOpen}
          payment={payment}
          booking={booking}
          handleChangePaymentStatus={rejectionInput => handleChangePaymentStatus(rejectionInput)}
          handleClose={handleDialogClose}
        />
      ) : null}
    </ExpansionPanel>
  );
};

interface AccountingWeeklyPaymentProps {
  payment: WeeklyPayment;
  booking: Booking;
  updateComponent?: () => void;
}

export default AccountingWeeklyPayment;
