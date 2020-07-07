import React from 'react';
import { Chip } from '@material-ui/core';
import Task from '../model/Task';

const TaskStatusChip = ({ task }: { task: Task }) => {
  return (
    <Chip
      size="small"
      label={`${
        task.dueDate && task.dueDate < new Date() && !task.resolved
          ? 'Overdue'
          : task.resolved
          ? 'Resolved'
          : task.show
          ? 'Pending'
          : !task.show && task.dueDate
          ? 'Future'
          : 'Not Created yet'
      }`}
      style={{
        backgroundColor:
          task.dueDate && task.dueDate < new Date() && !task.resolved
            ? '#f4364c'
            : task.resolved
            ? '#999999'
            : task.show
            ? '#00a2f2'
            : !task.show && task.dueDate
            ? '#3cb371'
            : '#999999',
        color: 'white',
      }}
    />
  );
};

export default TaskStatusChip;
