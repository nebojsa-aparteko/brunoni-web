import React from 'react';
import { Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography } from '@material-ui/core';
import Task from '../../model/Task';
import MyDayTableRow from './MyDayTableRow';

const MyDayTable: React.FC<Props> = ({ tasks }) => {
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
            <MyDayTableRow task={task} key={`${task.id}${task.bookingId}`} />
          ))}
          {/*<TableRow>*/}
          {/*  <TableCell align="center" />*/}
          {/*  <TableCell>*/}
          {/*    <Typography variant="h3">Header 1</Typography>*/}
          {/*  </TableCell>*/}
          {/*</TableRow>*/}
          {/*{tasks.map(task => (*/}
          {/*  <MyDayTableRow task={task} key={`${task.id}${task.bookingId}`} />*/}
          {/*))}*/}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default MyDayTable;

interface Props {
  tasks: Task[];
}
