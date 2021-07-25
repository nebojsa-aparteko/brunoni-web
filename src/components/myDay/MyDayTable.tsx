import React, { Fragment, useCallback, useState } from 'react';
import {
  Box,
  Button,
  Checkbox,
  createStyles,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Toolbar,
  Typography,
} from '@material-ui/core';
import Task, { TaskCategory } from '../../model/Task';
import ChartsCircularProgress from '../dashboard/ChartsCircularProgress';
import BookingsEmptyResults from '../bookings/BookingsEmptyResults';
import MyDayTableRow from './MyDayTableRow';
import clsx from 'clsx';
import { lighten, makeStyles, Theme } from '@material-ui/core/styles';
import UserInput from '../inputs/UserInput';
import theme from '../../theme';
import useAdminUsers from '../../hooks/useAdminUsers';
import { UserRecordMin, UserRecordMinProperties } from '../../model/UserRecord';
import firebase from '../../firebase';
import pick from 'lodash/fp/pick';
import { addActivityItem } from '../../utilities/activityHelper';
import { createActivityObject } from '../bookings/checklist/ChecklistItemRow';
import { ActivityChangeType } from '../bookings/checklist/ChecklistItemModel';
import { getActivityLogUserData } from '../../utilities/getActivityLogUserData';
import useUser from '../../hooks/useUser';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    toolbarRoot: {
      paddingLeft: theme.spacing(2),
      paddingRight: theme.spacing(1),
    },
    toolbarHighlight:
      theme.palette.type === 'light'
        ? {
            color: theme.palette.secondary.main,
            backgroundColor: lighten(theme.palette.secondary.light, 0.85),
          }
        : {
            color: theme.palette.secondary.dark,
            backgroundColor: theme.palette.secondary.dark,
          },
    toolbarTitle: {
      flex: '1 1 100%',
    },
  }),
);

interface EnhancedTableToolbarProps {
  numSelected: number;
  selectedTasks: string[];
  setSelectedTasks: (tasks: string[]) => void;
  trigger: () => void;
}

const EnhancedTableToolbar = (props: EnhancedTableToolbarProps) => {
  const classes = useStyles();
  const { numSelected, selectedTasks, setSelectedTasks, trigger } = props;
  const users = useAdminUsers();
  const userRecord = useUser()[1];
  const [assignTo, setAssignTo] = useState<UserRecordMin | undefined>(undefined);

  const onAssignUser = useCallback(() => {
    selectedTasks.forEach(async id => {
      const teamTasks = id.split('-');
      const [bookingId, taskId] = teamTasks[0].split('/');

      const taskRef = firebase
        .firestore()
        .collection('bookings')
        .doc(bookingId)
        .collection('tasks')
        .doc(taskId);

      const task = (await taskRef.get()).data() as Task;

      taskRef
        .update('assignedUser', pick(UserRecordMinProperties)(assignTo))
        .then(() => {
          setSelectedTasks([]);
          trigger();
        })
        .finally(async () => {
          await addActivityItem(
            'bookings',
            bookingId,
            createActivityObject({
              changeType: ActivityChangeType.ASSIGNED_ON_TASK,
              by: getActivityLogUserData(userRecord),
              addedUsers: [getActivityLogUserData(assignTo)],
              task,
            }),
          );
        });
    });
  }, [selectedTasks, assignTo, setSelectedTasks, trigger, userRecord]);

  return (
    <Toolbar
      className={clsx(classes.toolbarRoot, {
        [classes.toolbarHighlight]: numSelected > 0,
      })}
    >
      {numSelected > 0 ? (
        <Typography className={classes.toolbarTitle} variant="subtitle1" component="div">
          {numSelected === 1 ? `${numSelected} admin selected` : `${numSelected} admins selected`}
        </Typography>
      ) : (
        <Typography className={classes.toolbarTitle} variant="h5" id="tableTitle" component="div">
          Tasks
        </Typography>
      )}
      <Box display="flex" style={{ minWidth: theme.spacing(25) }} mr={1}>
        <UserInput
          label="Assign task to"
          users={users}
          onChange={(_, user) => {
            setAssignTo(user || undefined);
          }}
          value={assignTo}
        />
      </Box>
      <Button
        color="primary"
        variant="contained"
        onClick={onAssignUser}
        disabled={selectedTasks.length === 0}
        style={{ minWidth: 140, height: 54 }}
      >
        Assign user
      </Button>
    </Toolbar>
  );
};

const MyDayTable: React.FC<Props> = ({
  tasks,
  normalizedTasks,
  shouldShowTeamTasks,
  selectedTasks,
  setSelectedTasks,
  trigger,
  onSelectRow,
  updateComponent,
  taskCategory,
  handleOpenPreviewDialog,
  handleSelectDeselectAll,
}) => {
  const normalizedTasksLength: number = normalizedTasks
    ? normalizedTasks?.reduce((prev, current) => prev + current[1].length, 0)
    : 0;

  return (
    <Fragment>
      {tasks.length === 0 && normalizedTasksLength === 0 ? (
        <BookingsEmptyResults message={'No tasks found for your filter criteria. Try changing filters.'} />
      ) : (
        <Paper>
          <EnhancedTableToolbar
            numSelected={selectedTasks.length}
            selectedTasks={selectedTasks}
            setSelectedTasks={setSelectedTasks}
            trigger={trigger}
          />
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
                  <TableCell align="center">B/L Number</TableCell>
                  {taskCategory === TaskCategory.ACCOUNTING && <TableCell align="center">Reference</TableCell>}
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
                            onSelectRow={event =>
                              onSelectRow(event, `${task.bookingId}/${task.id}-${normalizedTask[0]}`)
                            }
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
        </Paper>
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
  setSelectedTasks: (tasks: string[]) => void;
  trigger: () => void;
  updateComponent: () => void;
  taskCategory: TaskCategory;
  handleOpenPreviewDialog: (bookingId: string) => void;
  handleSelectDeselectAll: () => void;
}
