import React, { useCallback, useContext } from 'react';
import Task, { TaskType } from '../model/Task';
import { IconButton } from '@material-ui/core';
import firebase from '../firebase';
import CheckCircleIcon from '@material-ui/icons/CheckCircle';
import CheckCircleOutlineIcon from '@material-ui/icons/CheckCircleOutline';
import { ActivityChangeType, ActivityLogUserData } from './bookings/checklist/ChecklistItemModel';
import WeeklyPayment, { WeeklyPaymentPlatformStatus, WeeklyPaymentStatus } from '../model/WeeklyPayment';
import { normalizePaymentOverview } from '../hooks/usePaymentOverview';
import { addActivityItem } from './bookings/checklist/ActivityLogContainer';
import { createActivityObject } from './bookings/checklist/ChecklistItemRow';
import UserRecordContext from '../contexts/UserRecordContext';

const getWeeklyPayment = async (paymentId: string | undefined) => {
  return normalizePaymentOverview(
    (
      await firebase
        .firestore()
        .collection('weeklyPayment')
        .doc(paymentId)
        .get()
    ).data(),
  ) as WeeklyPayment;
};

const TaskManualResolveButton: React.FC<Props> = ({ task, updateComponent }) => {
  const userRecord = useContext(UserRecordContext);

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

  return task.resolved ? (
    <IconButton
      aria-label="mark-as-unresolved"
      size="small"
      onClick={event => {
        event.stopPropagation();
        return firebase
          .firestore()
          .collection('bookings')
          .doc(task.bookingId)
          .collection('tasks')
          .doc(task.id)
          .set({ resolved: false }, { merge: true })
          .then(() => {
            const func = task.type === TaskType.CLEAR_INVOICE ? events[task.type] : undefined;
            return func ? func.unResolve(task) : new Promise(resolve => resolve(null));
          })
          .then(result => {
            if (result) {
              addActivityItem(
                task.bookingId,
                createActivityObject({
                  changeType: result as ActivityChangeType,
                  by: getActivityLogUserData(),
                  isAccountingActivity: true,
                  paymentActivityData: { paymentReference: task.paymentReference },
                }),
              ).then(() => console.log('Reverted invoice clearing.'));
            }
          })
          .then(() => (updateComponent ? updateComponent() : null));
      }}
    >
      <CheckCircleIcon />
    </IconButton>
  ) : (
    <IconButton
      aria-label="mark-as-resolved"
      size="small"
      onClick={event => {
        event.stopPropagation();
        firebase
          .firestore()
          .collection('bookings')
          .doc(task.bookingId)
          .collection('tasks')
          .doc(task.id)
          .set({ resolved: true }, { merge: true })
          .then(() => {
            const func = task.type === TaskType.CLEAR_INVOICE ? events[task.type] : undefined;
            return func ? func.resolve(task) : new Promise(resolve => resolve(null));
          })
          .then(result => {
            if (result) {
              addActivityItem(
                task.bookingId,
                createActivityObject({
                  changeType: result as ActivityChangeType,
                  by: getActivityLogUserData(),
                  isAccountingActivity: true,
                  paymentActivityData: { paymentReference: task.paymentReference },
                }),
              ).then(() => console.log('Invoice cleared.'));
            }
          })
          .then(() => (updateComponent ? updateComponent() : null));
      }}
    >
      <CheckCircleOutlineIcon />
    </IconButton>
  );
};

export default TaskManualResolveButton;

interface Props {
  task: Task;
  updateComponent?: () => void;
}

const events = {
  CLEAR_INVOICE: {
    resolve: async (task: Task): Promise<ActivityChangeType | null> => {
      const weeklyPayment = await getWeeklyPayment(task.paymentReference);
      const ref = task.paymentReference ? task.paymentReference : getPaymentRefFromTaskId(task.id);
      await firebase
        .firestore()
        .collection('weeklyPayment')
        .doc(ref)
        .set(
          {
            platformStatus:
              weeklyPayment.status === WeeklyPaymentStatus.BLOCKED
                ? WeeklyPaymentPlatformStatus.CLEARED
                : weeklyPayment.platformStatus,
          },
          { merge: true },
        );
      return ActivityChangeType.CLEAR_PAYMENT;
    },
    unResolve: async (task: Task): Promise<ActivityChangeType | null> => {
      const weeklyPayment = await getWeeklyPayment(task.paymentReference);
      const ref = task.paymentReference ? task.paymentReference : getPaymentRefFromTaskId(task.id);

      await firebase
        .firestore()
        .collection('weeklyPayment')
        .doc(ref)
        .set(
          {
            platformStatus:
              weeklyPayment.status === WeeklyPaymentStatus.BLOCKED &&
              weeklyPayment.platformStatus === WeeklyPaymentPlatformStatus.CLEARED
                ? null
                : weeklyPayment.platformStatus,
          },
          { merge: true },
        );
      return ActivityChangeType.REVERT_CLEAR_PAYMENT;
    },
  },
};

const getPaymentRefFromTaskId = (taskId: string) => {
  return taskId.split('_')?.[1];
};
