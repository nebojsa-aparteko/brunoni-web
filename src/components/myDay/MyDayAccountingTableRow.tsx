import React, { Fragment, useContext, useMemo } from 'react';
import { Checkbox, Link, TableCell, TableRow } from '@material-ui/core';
import Task, { ManualResolveType, TaskDescription } from '../../model/Task';
import formatDate from 'date-fns/format';
import ActingAs from '../../contexts/ActingAs';
import TaskStatusChip from '../TaskStatusChip';
import TaskAdditionalInfoView from '../TaskAdditionalInfoView';
import { TaskManualResolveAction } from '../tasks/BookingTaskTableRow';

const MyDayAccountingTableRow: React.FC<Props> = ({
  task,
  selected,
  onSelectRow,
  updateComponent,
  handleOpenPreviewDialog,
}) => {
  const actingAs = useContext(ActingAs)[0];
  const label = useMemo(
    () => Object.entries(TaskDescription).find(t => t[0] === task.type)?.[1],
    [task.type],
  );
  const handleRowClick = () => {
    handleOpenPreviewDialog(task.bookingId);
  };

  return (
    <Fragment>
      <TableRow key={task.id} hover onClick={handleRowClick} style={{ cursor: 'pointer' }}>
        <TableCell padding="checkbox">
          {!actingAs && (
            <Checkbox
              checked={selected}
              onClick={event => onSelectRow(event)}
              onFocus={event => event.stopPropagation()}
            />
          )}
        </TableCell>
        <TableCell id="taskDescriptionMyDay" align="left">
          {label || '-'}
        </TableCell>
        <TableCell align="center">{task.blNumber || '-'}</TableCell>
        <TableCell align="center">{task.paymentReference || '-'}</TableCell>
        <TableCell align="center">
          <Link target="_blank" href={`/bookings/${task.bookingId}`}>
            {task.bookingId}
          </Link>
        </TableCell>
        <TableCell align="center">{task.assignedUser?.emailAddress || '-'}</TableCell>
        <TableCell id="dueDateMyDay" align="center">
          {task.dueDate ? formatDate(task.dueDate, 'yyyy-MM-dd HH:mm:ss') : '-'}
        </TableCell>
        <TableCell id="taskStatusMyDay" align="center">
          <TaskStatusChip task={task} />
        </TableCell>
        <TableCell align="center">
          {task.additionalInfo && <TaskAdditionalInfoView additionalInfo={task.additionalInfo} />}
          {task.manualResolve && task.manualResolve !== ManualResolveType.NO_MANUAL_RESOLVE && (
            <TaskManualResolveAction task={task} updateComponent={updateComponent} />
          )}
        </TableCell>
      </TableRow>
    </Fragment>
  );
};

export default MyDayAccountingTableRow;
interface Props {
  task: Task;
  selected: boolean;
  onSelectRow: (event: React.MouseEvent<HTMLElement>) => void;
  updateComponent: () => void;
  handleOpenPreviewDialog: (bookingId: string) => void;
}
