import React, { Fragment, useCallback, useContext, useMemo, useState } from 'react';
import { Checkbox, Collapse, IconButton, Link, TableCell, TableRow } from '@material-ui/core';
import Task, { ManualResolveType, TaskDescription, UserRole } from '../../model/Task';
import formatDate from 'date-fns/format';
import KeyboardArrowDownIcon from '@material-ui/icons/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@material-ui/icons/KeyboardArrowUp';
import { BookingRow, BoookingProgressDialog } from '../bookings/BookingsTable';
import { normalizeBooking } from '../../providers/BookingsProvider';
import ActingAs from '../../contexts/ActingAs';
import useFirestoreDocument from '../../hooks/useFirestoreDocument';
import TaskStatusChip from '../TaskStatusChip';
import TaskManualResolveButton from '../TaskManualResolveButton';
import TaskAdditionalInfoView from '../TaskAdditionalInfoView';

const MyDayTableRow: React.FC<Props> = ({ task, selected, onSelectRow, updateComponent }) => {
  const [open, setOpen] = React.useState(false);
  const actingAs = useContext(ActingAs)[0];
  const snapshot = useFirestoreDocument('bookings', task.bookingId);
  const booking = useMemo(() => normalizeBooking(snapshot?.data()), [snapshot]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleProgressClick = useCallback(
    (event: React.MouseEvent<unknown>) => {
      event.stopPropagation();

      if (booking.Category === 'Export' || booking.Category === 'Import') {
        setIsDialogOpen(true);
      }
    },
    [setIsDialogOpen, booking],
  );

  const handleDialogClose = useCallback(() => {
    setIsDialogOpen(false);
  }, [setIsDialogOpen]);

  return (
    <Fragment>
      <TableRow
        key={task.id}
        style={{ cursor: 'pointer', backgroundColor: task.userRole === UserRole.ADMIN ? '#eee' : '#fff' }}
      >
        <TableCell padding="checkbox">
          {!actingAs && (
            <Checkbox checked={selected} onChange={onSelectRow} onFocus={event => event.stopPropagation()} />
          )}
        </TableCell>
        <TableCell id="taskDescriptionMyDay" align="left" onClick={() => setOpen(prevState => !prevState)}>
          {Object.entries(TaskDescription).find(t => t[0] === task.type)?.[1] || '-'}
        </TableCell>
        <TableCell align="center">
          <Link target="_blank" href={`/bookings/${task.bookingId}`}>
            {task.bookingId}
          </Link>
        </TableCell>
        <TableCell align="center" onClick={() => setOpen(prevState => !prevState)}>
          {task.assignedUser?.emailAddress || '-'}
        </TableCell>
        <TableCell id="dueDateMyDay" align="center" onClick={() => setOpen(prevState => !prevState)}>
          {task.dueDate ? formatDate(task.dueDate, 'yyyy-MM-dd HH:mm:ss') : '-'}
        </TableCell>
        <TableCell id="taskStatusMyDay" align="center" onClick={() => setOpen(prevState => !prevState)}>
          <TaskStatusChip task={task} />
        </TableCell>
        <TableCell onClick={() => setOpen(prevState => !prevState)}>
          <IconButton aria-label="expand row" size="small">
            {open ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
          </IconButton>
        </TableCell>
        <TableCell align="center">
          {task.additionalInfo && <TaskAdditionalInfoView additionalInfo={task.additionalInfo} />}
          {task.manualResolve && task.manualResolve !== ManualResolveType.NO_MANUAL_RESOLVE && (
            <TaskManualResolveButton task={task} updateComponent={updateComponent} />
          )}
        </TableCell>
      </TableRow>
      <TableRow>
        <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={6}>
          <Collapse in={open} timeout="auto" unmountOnExit>
            {booking && <BookingRow booking={booking} isAdmin={!actingAs} onProgressClick={handleProgressClick} />}
          </Collapse>
        </TableCell>
      </TableRow>
      {isDialogOpen && booking && (
        <BoookingProgressDialog isOpen={isDialogOpen} handleClose={handleDialogClose} booking={booking} />
      )}
    </Fragment>
  );
};

export default MyDayTableRow;
interface Props {
  task: Task;
  selected: boolean;
  onSelectRow: () => void;
  updateComponent: () => void;
}
