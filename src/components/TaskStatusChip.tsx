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

export type TaskStatus = 'Overdue' | 'Resolved' | 'Future' | 'Not Created yet' | 'Pending';

const taskFilters = {
  Overdue: (task: Task) => task.dueDate && task.dueDate < new Date() && !task.resolved,
  Pending: (task: Task) =>
    !task.resolved && task.show && (!task.dueDate || !(task.dueDate < new Date())),
  Resolved: () => false,
  'Not Created yet': () => false,
  Future: () => false,
};

export const getTaskFilter = (taskStatus: TaskStatus) => taskFilters[taskStatus];
