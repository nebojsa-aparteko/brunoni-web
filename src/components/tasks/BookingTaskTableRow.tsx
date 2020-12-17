import React from 'react';
import Task, { ManualResolveType, TaskDescription, UserRole } from '../../model/Task';
import { Box, Checkbox, Link, TableCell, TableRow, Typography } from '@material-ui/core';
import formatDate from 'date-fns/format';
import TaskStatusChip from '../TaskStatusChip';
import TaskManualResolveButton from '../TaskManualResolveButton';
import TaskAdditionalInfoView from '../TaskAdditionalInfoView';
import TaskManualDeclineButton from '../TaskManualDeclineButton';

export const TaskManualResolveAction: React.FC<{ task: Task; updateComponent?: () => void }> = ({
  task,
  updateComponent,
}) =>
  task.manualResolve === ManualResolveType.RESOLVE_OR_DECLINE ? (
    <Box display="flex" flexDirection="row" justifyContent="space-between">
      <TaskManualResolveButton task={task} updateComponent={updateComponent} />
      <TaskManualDeclineButton task={task} updateComponent={updateComponent} />
    </Box>
  ) : (
    <TaskManualResolveButton task={task} />
  );

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
      <TableCell align="center">{task.blNumber || '-'}</TableCell>
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
        {task.manualResolve && task.manualResolve !== ManualResolveType.NO_MANUAL_RESOLVE && (
          <TaskManualResolveAction task={task} />
        )}
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
