import React from 'react';
import Task from '../model/Task';
import { IconButton } from '@material-ui/core';
import firebase from '../firebase';
import CheckCircleIcon from '@material-ui/icons/CheckCircle';
import CheckCircleOutlineIcon from '@material-ui/icons/CheckCircleOutline';

const TaskManualResolveButton: React.FC<Props> = ({ task, updateComponent }) =>
  task.resolved ? (
    <IconButton
      aria-label="mark-as-resolved"
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
          .then(() => (updateComponent ? updateComponent() : null));
      }}
    >
      <CheckCircleIcon />
    </IconButton>
  ) : (
    <IconButton
      aria-label="mark-as-unresolved"
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
          .then(() => (updateComponent ? updateComponent() : null));
      }}
    >
      <CheckCircleOutlineIcon />
    </IconButton>
  );
export default TaskManualResolveButton;

interface Props {
  task: Task;
  updateComponent?: () => void;
}
