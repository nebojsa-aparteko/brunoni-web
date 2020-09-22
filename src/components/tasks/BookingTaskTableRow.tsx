import React from 'react';
import Task from '../../model/Task';
import { TaskDescription, UserRole } from '../../model/Task';
import { Checkbox, Link, TableCell, TableRow, Typography } from '@material-ui/core';
import formatDate from 'date-fns/format';
import TaskStatusChip from '../TaskStatusChip';
import TaskManualResolveButton from '../TaskManualResolveButton';
import TaskAdditionalInfoView from '../TaskAdditionalInfoView';

const BookingTaskTableRow: React.FC<Props> = ({ task, onSelectTask, selected }) => {
  return (
    <TableRow
      key={task.id}
      style={{
        backgroundColor: task.userRole === UserRole.ADMIN ? '#eee' : '#fff',
      }}
    >
      <TableCell align="left">
        <Checkbox
          checked={selected}
          onChange={event => {
            event.stopPropagation();
            onSelectTask(`${task.bookingId}/${task.id}`);
          }}
          onFocus={event => event.stopPropagation()}
          disabled={task.resolved}
        />
      </TableCell>
      <TableCell align="left">
        <Typography variant="subtitle1">
          {Object.entries(TaskDescription).find(t => t[0] === task.type)?.[1] || '-'}
        </Typography>
      </TableCell>
      <TableCell align="center">
        <Link target="_blank" href={`/bookings/${task.bookingId}`}>
          {task.bookingId}
        </Link>
      </TableCell>
      <TableCell align="center">{task.assignedUser?.emailAddress || '-'}</TableCell>
      <TableCell align="center">{task.dueDate ? formatDate(task.dueDate, 'yyyy-MM-dd HH:mm:ss') : '-'}</TableCell>
      <TableCell align="center">
        <TaskStatusChip task={task} />
      </TableCell>

      <TableCell align="center">
        {task.additionalInfo && <TaskAdditionalInfoView additionalInfo={task.additionalInfo} />}
        {task.manualResolve && <TaskManualResolveButton task={task} />}
      </TableCell>
    </TableRow>
  );
};

export default BookingTaskTableRow;

interface Props {
  task: Task;
  selected: boolean;
  onSelectTask: (id: string) => void;
}
