import React from 'react';
import { Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@material-ui/core';
import Task from '../../model/Task';
import MyDayTableRow from './MyDayTableRow';

const MyDayTable: React.FC<Props> = ({ tasks }) => {
  return (
    <TableContainer component={Paper}>
      <Table aria-label="simple table">
        <TableHead>
          <TableRow>
            <TableCell align="center">Task</TableCell>
            <TableCell align="center">Booking</TableCell>
            <TableCell align="center">Assigned To</TableCell>
            <TableCell align="center">Due Date</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {tasks.map(task => (
            <MyDayTableRow task={task} />
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default MyDayTable;

interface Props {
  tasks: Task[];
}
