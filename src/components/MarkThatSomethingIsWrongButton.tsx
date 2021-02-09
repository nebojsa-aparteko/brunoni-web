import React, { useCallback, useContext } from 'react';
import { TaskType } from '../model/Task';
import { IconButton, Tooltip, Typography } from '@material-ui/core';
import firebase from '../firebase';
import { ActivityChangeType, ActivityLogUserData } from './bookings/checklist/ChecklistItemModel';
import { addActivityItem } from './bookings/checklist/ActivityLogContainer';
import { createActivityObject } from './bookings/checklist/ChecklistItemRow';
import { Booking } from '../model/Booking';
import { endOfDay } from 'date-fns';
import BlockIcon from '@material-ui/icons/Block';
import ActingAs from '../contexts/ActingAs';
import WeeklyPayment from '../model/WeeklyPayment';
import UserRecordContext from '../contexts/UserRecordContext';
import { useSnackbar } from 'notistack';

const showSomethingWrongTask = (booking: Booking, reference: string) => {
  return firebase
    .firestore()
    .collection('bookings')
    .doc(booking?.id)
    .collection('tasks')
    .doc(`${TaskType.CHECK_FILE}_${reference}`)
    .set(
      { show: true, resolved: false, createAt: new Date(), dueDate: endOfDay(new Date()), paymentReference: reference },
      { merge: true },
    );
};

const MarkThatSomethingIsWrongButton: React.FC<Props> = ({ payment, booking, updateComponent }) => {
  const userRecord = useContext(UserRecordContext);
  const [actingAs] = useContext(ActingAs);
  const isAdmin = !actingAs;
  const { enqueueSnackbar } = useSnackbar();

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

  const handleSetIsSomethingWrong = () => {
    payment &&
      payment.reference &&
      showSomethingWrongTask(booking, payment.reference).then(() =>
        storeAccountingActivity(() =>
          addActivityItem(
            booking!.id,
            createActivityObject({
              changeType: ActivityChangeType.MARK_SOMETHING_WRONG,
              by: getActivityLogUserData(),
              isAccountingActivity: true,
              paymentReference: payment.reference,
            }),
          ),
        ),
      );
  };

  return (
    <Tooltip title="Mark that something is wrong">
      <span>
        <IconButton
          size="small"
          aria-label="Mark that something is wrong"
          onClick={handleSetIsSomethingWrong}
          disabled={!isAdmin}
        >
          <BlockIcon />
        </IconButton>
      </span>
    </Tooltip>
  );
};

export default MarkThatSomethingIsWrongButton;

interface Props {
  payment: WeeklyPayment;
  booking: Booking;
  updateComponent?: () => void;
}
