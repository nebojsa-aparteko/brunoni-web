import React from 'react';
import { Link, TableCell, TableRow } from '@material-ui/core';
import Task, { TaskDescription } from '../../model/Task';
import formatDate from 'date-fns/format';

const MyDayTableRow: React.FC<Props> = ({ task }) => {
  return (
    <TableRow key={task.id}>
      <TableCell align="left">{Object.values(TaskDescription)[task.type - 1] || '-'}</TableCell>
      <TableCell align="center">
        <Link target="_blank" href={`/bookings/${task.bookingId}`}>
          {task.bookingId}
        </Link>
      </TableCell>
      <TableCell align="center">{task.assignedUser?.emailAddress || '-'}</TableCell>
      <TableCell align="center">{task.dueDate ? formatDate(task.dueDate, 'yyyy-MM-dd HH:mm:ss') : '-'}</TableCell>
    </TableRow>
  );
};

export default MyDayTableRow;
interface Props {
  task: Task;
}
