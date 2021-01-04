import React, { Fragment, useCallback, useContext, useEffect, useState } from 'react';
import { Box, Checkbox, CircularProgress, Collapse, IconButton, Link, TableCell, TableRow } from '@material-ui/core';
import Task, { ManualResolveType, TaskDescription, UserRole } from '../../model/Task';
import formatDate from 'date-fns/format';
import KeyboardArrowDownIcon from '@material-ui/icons/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@material-ui/icons/KeyboardArrowUp';
import { BookingRow, BookingProgressDialog } from '../bookings/BookingsTable';
import { normalizeBooking } from '../../providers/BookingsProvider';
import ActingAs from '../../contexts/ActingAs';
import TaskStatusChip from '../TaskStatusChip';
import TaskAdditionalInfoView from '../TaskAdditionalInfoView';
import { TaskManualResolveAction } from '../tasks/BookingTaskTableRow';
import { Booking } from '../../model/Booking';
import firebase from '../../firebase';

const getBooking = (bookingId: string) =>
  firebase
    .firestore()
    .collection('bookings')
    .doc(bookingId)
    .get();

const MyDayOperationsTableRow: React.FC<Props> = ({ task, selected, onSelectRow, updateComponent }) => {
  const [open, setOpen] = React.useState(false);
  const actingAs = useContext(ActingAs)[0];
  const [booking, setBooking] = useState<Booking | undefined>(undefined);
  const [isFirstOpen, setIsFirstOpen] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  useEffect(() => {
    if (!task.bookingId) return;

    if (open)
      getBooking(task.bookingId).then(b => {
        setBooking(normalizeBooking(b.data()) as Booking);
      });
  }, [task.bookingId, open]);

  const handleProgressClick = useCallback(
    (event: React.MouseEvent<unknown>) => {
      event.stopPropagation();
      if (isFirstOpen && !booking) {
        setIsFirstOpen(false);
        getBooking(task.bookingId).then(b => {
          setBooking(normalizeBooking(b.data()) as Booking);
        });
      }
      if (booking && (booking.Category === 'Export' || booking.Category === 'Import')) {
        setIsDialogOpen(true);
      }
    },
    [setIsDialogOpen, booking, isFirstOpen, task.bookingId],
  );

  const handleDialogClose = useCallback(() => {
    setIsDialogOpen(false);
  }, [setIsDialogOpen]);

  const handleRowClick = () => {
    setOpen(prevState => !prevState);
    if (isFirstOpen && !booking) {
      setIsFirstOpen(false);
      getBooking(task.bookingId).then(b => {
        setBooking(normalizeBooking(b.data()) as Booking);
      });
    }
  };

  return (
    <Fragment>
      <TableRow
        key={task.id}
        hover
        onClick={handleRowClick}
        style={{ cursor: 'pointer', backgroundColor: task.userRole === UserRole.ADMIN ? '#eee' : '#fff' }}
      >
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
          {Object.entries(TaskDescription).find(t => t[0] === task.type)?.[1] || '-'}
        </TableCell>
        <TableCell align="center">{task.blNumber || '-'}</TableCell>
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
        <TableCell>
          <IconButton aria-label="expand row" size="small">
            {open ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
          </IconButton>
        </TableCell>
        <TableCell align="center">
          {task.additionalInfo && <TaskAdditionalInfoView additionalInfo={task.additionalInfo} />}
          {task.manualResolve && task.manualResolve !== ManualResolveType.NO_MANUAL_RESOLVE && (
            <TaskManualResolveAction task={task} updateComponent={updateComponent} />
          )}
        </TableCell>
      </TableRow>
      <TableRow>
        <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={8}>
          <Collapse in={open} timeout="auto" unmountOnExit>
            {booking === undefined ? (
              <Box display="flex" height={250}>
                <CircularProgress style={{ padding: 8, margin: 'auto' }} />
              </Box>
            ) : (
              <BookingRow booking={booking} isAdmin={!actingAs} onProgressClick={handleProgressClick} />
            )}
          </Collapse>
        </TableCell>
      </TableRow>
      {isDialogOpen && booking && (
        <BookingProgressDialog isOpen={isDialogOpen} handleClose={handleDialogClose} booking={booking} />
      )}
    </Fragment>
  );
};

export default MyDayOperationsTableRow;
interface Props {
  task: Task;
  selected: boolean;
  onSelectRow: (event: React.MouseEvent<HTMLElement>) => void;
  updateComponent: () => void;
}
