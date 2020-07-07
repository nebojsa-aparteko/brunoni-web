import React from 'react';
import { Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@material-ui/core';
import Task from '../../model/Task';
import BookingTaskTableRow from './BookingTaskTableRow';

const BookingTaskTable: React.FC<Props> = ({ tasks }) => {
  return (
    <TableContainer component={Paper}>
      <Table aria-label="simple table">
        <TableHead>
          <TableRow>
            <TableCell align="center" />
            <TableCell align="center">Task</TableCell>
            <TableCell align="center">File No.</TableCell>
            <TableCell align="center">Assigned To</TableCell>
            <TableCell align="center">Due Date</TableCell>
            <TableCell align="center">Task status</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {tasks.map(task => (
            <BookingTaskTableRow task={task} key={task.id} />
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default BookingTaskTable;

interface Props {
  tasks: Task[];
}
