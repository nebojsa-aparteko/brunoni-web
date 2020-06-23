import React, { Fragment, useContext, useEffect, useState } from 'react';
import { Button, Collapse, IconButton, Link, TableCell, TableRow } from '@material-ui/core';
import Task, { TaskDescription } from '../../model/Task';
import formatDate from 'date-fns/format';
import KeyboardArrowDownIcon from '@material-ui/icons/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@material-ui/icons/KeyboardArrowUp';
import { BookingRow } from '../bookings/BookingsTable';
import { Booking } from '../../model/Booking';
import firebase from '../../firebase';
import { normalizeBooking } from '../../providers/BookingsProvider';
import ActingAs from '../../contexts/ActingAs';

const MyDayTableRow: React.FC<Props> = ({ task, onResolve }) => {
  const [open, setOpen] = React.useState(false);
  const [booking, setBooking] = useState<Booking | undefined>(undefined);
  const actingAs = useContext(ActingAs)[0];
  useEffect(() => {
    firebase
      .firestore()
      .collection('bookings')
      .doc(task.bookingId)
      .get()
      .then(bkg => {
        setBooking(normalizeBooking(bkg.data()));
      });
  }, [task]);
  return (
    <Fragment>
      <TableRow key={task.id} onClick={() => setOpen(prevState => !prevState)} style={{ cursor: 'pointer' }}>
        <TableCell>
          <IconButton aria-label="expand row" size="small">
            {open ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
          </IconButton>
        </TableCell>
        <TableCell align="left">{Object.values(TaskDescription)[task.type] || '-'}</TableCell>
        <TableCell align="center">
          <Link target="_blank" href={`/bookings/${task.bookingId}`}>
            {task.bookingId}
          </Link>
        </TableCell>
        <TableCell align="center">{task.assignedUser?.emailAddress || '-'}</TableCell>
        <TableCell align="center">{task.dueDate ? formatDate(task.dueDate, 'yyyy-MM-dd HH:mm:ss') : '-'}</TableCell>
        <TableCell align="center">
          <Button
            variant="outlined"
            onClick={event => {
              event.stopPropagation();
              onResolve(task.bookingId, task.id);
              setOpen(false);
            }}
            disabled={task.resolved}
          >
            Resolve
          </Button>
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
  onResolve: (bookingId: string, taskId: string) => void;
}
