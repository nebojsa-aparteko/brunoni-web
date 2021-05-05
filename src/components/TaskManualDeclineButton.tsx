import React from 'react';
import Task, { TaskType } from '../model/Task';
import { IconButton } from '@material-ui/core';
import firebase from '../firebase';
import HighlightOffIcon from '@material-ui/icons/HighlightOff';
import HighlightOffOutlinedIcon from '@material-ui/icons/HighlightOffOutlined';
import { endOfDay } from 'date-fns/fp';

const taskRef = (bookingId: string, taskId: string | TaskType) =>
  firebase
    .firestore()
    .collection('bookings')
    .doc(bookingId)
    .collection('tasks')
    .doc(taskId);

const TaskManualDeclineButton: React.FC<Props> = ({ task, updateComponent }) =>
  task.resolved ? (
    <IconButton
      aria-label="mark-as-resolved"
      size="small"
      onClick={event => {
        event.stopPropagation();
        taskRef(task.bookingId, task.id)
          .set({ resolved: false }, { merge: true })
          .then(() =>
            task.declineManualResolveAction
              ? taskRef(task.bookingId, task.declineManualResolveAction).set(
                  { resolved: false, createAt: null, show: false, dueDate: null },
                  { merge: true },
                )
              : new Promise<void>(resolve => resolve()),
          )
          .then(() => (updateComponent ? updateComponent() : null));
      }}
    >
      <HighlightOffIcon />
    </IconButton>
  ) : (
    <IconButton
      aria-label="mark-as-unresolved"
      size="small"
      onClick={event => {
        event.stopPropagation();
        taskRef(task.bookingId, task.id)
          .set({ resolved: true }, { merge: true })
          .then(() =>
            task.declineManualResolveAction
              ? taskRef(task.bookingId, task.declineManualResolveAction).set(
                  { resolved: false, createAt: new Date(), show: true, dueDate: endOfDay(new Date()) },
                  { merge: true },
                )
              : new Promise<void>(resolve => resolve()),
          )
          .then(() => (updateComponent ? updateComponent() : null));
      }}
    >
      <HighlightOffOutlinedIcon />
    </IconButton>
  );
export default TaskManualDeclineButton;

interface Props {
  task: Task;
  updateComponent?: () => void;
}
