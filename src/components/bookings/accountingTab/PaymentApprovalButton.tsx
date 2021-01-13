import React, { useCallback, useContext, useMemo, useState } from 'react';
import WeeklyPayment, {
  WeeklyPaymentApiAction,
  WeeklyPaymentPlatformStatus,
  WeeklyPaymentStatus,
} from '../../../model/WeeklyPayment';
import {
  ActivityChangeType,
  ActivityLogUserData,
  ChecklistItemValueDocumentStatusType,
  DocumentValue,
} from '../checklist/ChecklistItemModel';
import {
  Box,
  Button,
  createStyles,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  IconButton,
  makeStyles,
  Theme,
  Tooltip,
  Typography,
} from '@material-ui/core';
import { showCrispChat } from '../../../index';
import ConfirmationDialog from '../../ConfirmationDialog';
import { RejectionInput } from '../documentApproval/RejectionModal';
import CloseIcon from '@material-ui/icons/Close';
import CommentInput from '../../CommentInput';
import { TeamType } from '../../../model/Teams';
import { Booking } from '../../../model/Booking';
import { addActivityItem } from '../checklist/ActivityLogContainer';
import { createActivityObject } from '../checklist/ChecklistItemRow';
import { ActivityType } from '../checklist/ActivityModel';
import UserRecordContext from '../../../contexts/UserRecordContext';
import { GlobalContext } from '../../../store/GlobalStore';
import ActingAs from '../../../contexts/ActingAs';
import { useSnackbar } from 'notistack';
import useUser from '../../../hooks/useUser';

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
          <Button
            onClick={onReject}
            disabled={!rejectionInput || rejectionInput.messagePlain.trim() === ''}
            color="primary"
            variant="contained"
          >
            Confirm
          </Button>
        </DialogActions>
      </Box>
    </Dialog>
  );
};

const PaymentApprovalButton: React.FC<PaymentApprovalProps> = ({
  payment,
  booking,
  accountingDocuments,
  updateComponent,
}) => {
  const userRecord = useContext(UserRecordContext);
  const actingAs = useContext(ActingAs)[0];
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [user] = useUser();
  const { enqueueSnackbar } = useSnackbar();
  const [, dispatch] = useContext(GlobalContext);

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

  const handleDialogClose = useCallback(() => {
    showCrispChat(true);
    setIsDialogOpen(false);
  }, [setIsDialogOpen]);

  const handleDialogOpen = useCallback(() => {
    showCrispChat(false);
    setIsDialogOpen(true);
  }, [setIsDialogOpen]);

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
                paymentActivityData: { paymentReference: payment.reference },
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

  const paymentApprovalDisabled = useMemo(
    () =>
      payment.platformStatus === WeeklyPaymentPlatformStatus.ON_HOLD ||
      !(
        payment.status === WeeklyPaymentStatus.IN_PROGRESS &&
        (accountingDocuments && accountingDocuments.length > 0
          ? accountingDocuments.every(
              document => document.status?.type === ChecklistItemValueDocumentStatusType.APPROVED,
            )
          : payment.carrier !== 'Hamburg Süd')
      ),
    [payment, accountingDocuments],
  );

  return (
    <React.Fragment>
      {payment.status === WeeklyPaymentStatus.IN_PROGRESS ? (
        paymentApprovalDisabled ? (
          <Tooltip title={'All files must be approved first'} placement="top">
            <span>
              <Button onClick={handleDialogOpen} color="primary" variant="contained" disabled={true}>
                Approve Payment
              </Button>
            </span>
          </Tooltip>
        ) : (
          <Button onClick={handleDialogOpen} color="primary" variant="contained">
            Approve Payment
          </Button>
        )
      ) : (
        ((payment.platformStatus && payment.platformStatus === WeeklyPaymentPlatformStatus.CLEARED) ||
          payment.status === WeeklyPaymentStatus.BLOCKED) && (
          <Button onClick={handleDialogOpen} color="primary" variant="outlined">
            Revert Approval
          </Button>
        )
      )}
      {payment.status === WeeklyPaymentStatus.IN_PROGRESS ? (
        <ConfirmationDialog
          isOpen={isDialogOpen}
          description="If you confirm this action, that will block this file! Are you sure you want to approve payment on this file?"
          label="Please confirm payment approval"
          handleConfirm={() => handleChangePaymentStatus(undefined)}
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
    </React.Fragment>
  );
};

interface PaymentApprovalProps {
  payment: WeeklyPayment;
  booking: Booking;
  accountingDocuments: DocumentValue[];
  updateComponent?: () => void;
}

export default PaymentApprovalButton;
