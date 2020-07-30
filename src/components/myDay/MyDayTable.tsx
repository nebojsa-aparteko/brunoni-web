import React, { Fragment, useCallback, useState } from 'react';
import { Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography } from '@material-ui/core';
import Task from '../../model/Task';
import MyDayTableRow from './MyDayTableRow';
import ChartsCircularProgress from '../dashboard/ChartsCircularProgress';

const MyDayTable: React.FC<Props> = ({ tasks, normalizedTasks, shouldShowTeamTasks, selectedTasks, onSelectRow }) => {
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
            <MyDayTableRow
              task={task}
              key={`${task.bookingId}/${task.id}`}
              selected={selectedTasks.includes(`${task.bookingId}/${task.id}`)}
              onSelectRow={() => onSelectRow(`${task.bookingId}/${task.id}`)}
            />
          ))}
          {normalizedTasks ? (
            normalizedTasks.map(normalizedTask =>
              shouldShowTeamTasks && normalizedTask[1].length > 0 ? (
                <Fragment key={normalizedTask[0]}>
                  <TableRow>
                    <TableCell align="center" />
                    <TableCell>
                      <Typography variant="h3">{normalizedTask[0]}</Typography>
                    </TableCell>
                  </TableRow>
                  {normalizedTask[1].map(task => (
                    <MyDayTableRow
                      task={task}
                      key={`${task.bookingId}/${task.id}-${normalizedTask[0]}`}
                      selected={selectedTasks.includes(`${task.bookingId}/${task.id}-${normalizedTask[0]}`)}
                      onSelectRow={() => onSelectRow(`${task.bookingId}/${task.id}-${normalizedTask[0]}`)}
                    />
                  ))}
                </Fragment>
              ) : null,
            )
          ) : (
            <ChartsCircularProgress />
          )}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default MyDayTable;

interface Props {
  tasks: Task[];
  normalizedTasks: [string, Task[]][] | undefined;
  shouldShowTeamTasks: boolean;
  onSelectRow: (id: string) => void;
  selectedTasks: string[];
}
