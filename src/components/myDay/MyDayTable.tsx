import React, { Fragment } from 'react';
import {
  Checkbox,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@material-ui/core';
import Task, { TaskCategory } from '../../model/Task';
import ChartsCircularProgress from '../dashboard/ChartsCircularProgress';
import BookingsEmptyResults from '../bookings/BookingsEmptyResults';
import MyDayTableRow from './MyDayTableRow';

const MyDayTable: React.FC<Props> = ({
  tasks,
  normalizedTasks,
  shouldShowTeamTasks,
  selectedTasks,
  onSelectRow,
  updateComponent,
  taskCategory,
  handleOpenPreviewDialog,
  handleSelectDeselectAll,
}) => {
  const normalizedTasksLength: number = normalizedTasks
    ? normalizedTasks.length > 0
      ? normalizedTasks.length > 2
        ? normalizedTasks.map(normalizedTask => normalizedTask[1].length).reduce((a, b) => a + b)
        : normalizedTasks[0][1].length
      : 0
    : 0;

  return (
    <Fragment>
      {tasks.length === 0 && normalizedTasks?.reduce((prev, current) => prev + current[1].length, 0) === 0 ? (
        <BookingsEmptyResults message={'No tasks found for your filter criteria. Try changing filters.'} />
      ) : (
        <TableContainer component={Paper}>
          <Table aria-label="simple table">
            <TableHead>
              <TableRow>
                <TableCell align="left" style={{ paddingLeft: 4 }}>
                  <Checkbox
                    checked={selectedTasks.length === tasks.length + normalizedTasksLength}
                    onClick={handleSelectDeselectAll}
                    onFocus={event => event.stopPropagation()}
                  />
                </TableCell>
                <TableCell align="center">Task</TableCell>
                <TableCell align="center">File No.</TableCell>
                <TableCell align="center">Assigned To</TableCell>
                <TableCell align="center">Due Date</TableCell>
                <TableCell align="center">Task status</TableCell>
                {taskCategory === TaskCategory.OPERATIONS && <TableCell align="center" />}
                <TableCell align="center" />
              </TableRow>
            </TableHead>
            <TableBody>
              {tasks.map(task => (
                <MyDayTableRow
                  task={task}
                  key={`${task.bookingId}/${task.id}`}
                  selected={selectedTasks.includes(`${task.bookingId}/${task.id}`)}
                  onSelectRow={event => onSelectRow(event, `${task.bookingId}/${task.id}`)}
                  updateComponent={updateComponent}
                  handleOpenPreviewDialog={handleOpenPreviewDialog}
                  taskCategory={taskCategory}
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
                          onSelectRow={event => onSelectRow(event, `${task.bookingId}/${task.id}-${normalizedTask[0]}`)}
                          updateComponent={updateComponent}
                          handleOpenPreviewDialog={handleOpenPreviewDialog}
                          taskCategory={taskCategory}
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
      )}
    </Fragment>
  );
};

export default MyDayTable;

interface Props {
  tasks: Task[];
  normalizedTasks: [string, Task[]][] | undefined;
  shouldShowTeamTasks: boolean;
  onSelectRow: (event: React.MouseEvent<HTMLElement>, id: string) => void;
  selectedTasks: string[];
  updateComponent: () => void;
  taskCategory: TaskCategory;
  handleOpenPreviewDialog: (bookingId: string) => void;
  handleSelectDeselectAll: () => void;
}
