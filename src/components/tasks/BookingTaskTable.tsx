import React from 'react';
import { Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@material-ui/core';
import Task from '../../model/Task';
import BookingTaskTableRow from './BookingTaskTableRow';

const BookingTaskTable: React.FC<Props> = ({ tasks, selectedTasks, onSelectTask }) => {
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
            <TableCell align="center" />
          </TableRow>
        </TableHead>
        <TableBody>
          {tasks.map(task => (
            <BookingTaskTableRow
              task={task}
              key={task.id}
              selected={selectedTasks.includes(`${task.bookingId}/${task.id}`)}
              onSelectTask={onSelectTask}
            />
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default BookingTaskTable;

interface Props {
  tasks: Task[];
  selectedTasks: string[];
  onSelectTask: (bookingId: string) => void;
}
