import React, { Fragment, useContext, useMemo } from 'react';
import { Checkbox, Collapse, IconButton, Link, TableCell, TableRow } from '@material-ui/core';
import Task, { TaskDescription, UserRole } from '../../model/Task';
import formatDate from 'date-fns/format';
import KeyboardArrowDownIcon from '@material-ui/icons/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@material-ui/icons/KeyboardArrowUp';
import { BookingRow } from '../bookings/BookingsTable';
import { normalizeBooking } from '../../providers/BookingsProvider';
import ActingAs from '../../contexts/ActingAs';
import useFirestoreDocument from '../../hooks/useFirestoreDocument';
import TaskStatusChip from '../TaskStatusChip';

const MyDayTableRow: React.FC<Props> = ({ task }) => {
  const [open, setOpen] = React.useState(false);
  const actingAs = useContext(ActingAs)[0];
  const snapshot = useFirestoreDocument('bookings', task.bookingId);
  const booking = useMemo(() => normalizeBooking(snapshot?.data()), [snapshot]);

  return (
    <Fragment>
      <TableRow
        key={task.id}
        onClick={() => setOpen(prevState => !prevState)}
        style={{ cursor: 'pointer', backgroundColor: task.userRole === UserRole.ADMIN ? '#eee' : '#fff' }}
      >
        <TableCell padding="checkbox">
          <Checkbox
            checked={task.selected}
            onChange={_ => {
              task.selected = !task.selected;
            }}
            onFocus={event => event.stopPropagation()}
          />
        </TableCell>
        <TableCell align="left">{Object.entries(TaskDescription).find(t => t[0] === task.type)?.[1] || '-'}</TableCell>
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
        <TableCell>
          <IconButton aria-label="expand row" size="small">
            {open ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
          </IconButton>
        </TableCell>
      </TableRow>
      <TableRow>
        <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={6}>
          <Collapse in={open} timeout="auto" unmountOnExit>
            {booking && <BookingRow booking={booking} isAdmin={!actingAs} />}
          </Collapse>
        </TableCell>
      </TableRow>
    </Fragment>
  );
};

export default MyDayTableRow;
interface Props {
  task: Task;
}
