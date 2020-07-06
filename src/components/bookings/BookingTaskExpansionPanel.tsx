import React, { useState } from 'react';
import {
  Box,
  Button,
  Checkbox,
  Chip,
  ExpansionPanel,
  ExpansionPanelDetails,
  ExpansionPanelSummary,
  Link,
  TableCell,
  TableRow,
  Typography,
} from '@material-ui/core';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import Task, { TaskDescription } from '../../model/Task';
import formatDate from 'date-fns/format';
import theme from '../../theme';
import UserInput from '../inputs/UserInput';
import firebase from '../../firebase';
import pick from 'lodash/fp/pick';
import { UserRecordMin, UserRecordMinProperties } from '../../model/UserRecord';
import useAdminUsers from '../../hooks/useAdminUsers';
import { resolveTask } from '../myDay/MyDayContainer';
import { NotificationType } from '../../model/Notification';

const BookingTaskExpansionPanel: React.FC<Props> = ({ tasks }) => {
  const users = useAdminUsers();
  const [assignTo, setAssignTo] = useState<UserRecordMin | undefined>(undefined);

  return (
    <ExpansionPanel>
      <ExpansionPanelSummary expandIcon={<ExpandMoreIcon />} aria-controls="panel1a-content" id="panel1a-header">
        <Box
          style={{
            display: 'flex',
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            flex: 1,
          }}
        >
          <Typography>{tasks.length} Tasks</Typography>
          <Box display="flex" flexDirection="row">
            <Box display="flex" style={{ minWidth: theme.spacing(35) }} mr={1}>
              <UserInput
                label="Assign task to"
                users={users}
                onChange={(event, user) => {
                  console.log(user);
                  setAssignTo(user || undefined);
                  event.stopPropagation();
                }}
                value={assignTo}
              />
            </Box>
            <Button
              color="primary"
              variant="contained"
              onClick={event => {
                // console.log(tasks?.filter(task => task.selected));
                event.stopPropagation();
                tasks
                  ?.filter(task => task.selected)
                  .forEach(task =>
                    firebase
                      .firestore()
                      .collection('bookings')
                      .doc(task.bookingId)
                      .collection('tasks')
                      .doc(task.id)
                      .update('assignedUser', pick(UserRecordMinProperties)(assignTo)),
                  );
              }}
            >
              Assign user
            </Button>
          </Box>
        </Box>
      </ExpansionPanelSummary>
      <ExpansionPanelDetails style={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
        {tasks.map(task => (
          <TableRow
            key={task.id}
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              marginTop: theme.spacing(1),
              marginBottom: theme.spacing(1),
            }}
          >
            <TableCell align="left" style={{ width: '10%' }}>
              <Checkbox
                checked={task.selected}
                onChange={event => {
                  event.stopPropagation();
                  task.selected = !task.selected;
                }}
                onFocus={event => event.stopPropagation()}
                disabled={task.resolved}
              />
            </TableCell>
            <TableCell align="left" style={{ width: '30%' }}>
              <Typography variant="subtitle1">
                {Object.entries(TaskDescription).find(t => t[0] === task.type)?.[1] || '-'}
              </Typography>
            </TableCell>
            <TableCell align="center" style={{ width: '15%' }}>
              <Link target="_blank" href={`/bookings/${task.bookingId}`}>
                {task.bookingId}
              </Link>
            </TableCell>
            <TableCell align="center" style={{ width: '20%' }}>
              {task.assignedUser?.emailAddress || '-'}
            </TableCell>
            <TableCell align="center" style={{ width: '15%' }}>
              {task.dueDate ? formatDate(task.dueDate, 'yyyy-MM-dd HH:mm:ss') : '-'}
            </TableCell>
            <TableCell align="center" style={{ width: '10%' }}>
              {/*<Button*/}
              {/*  variant="outlined"*/}
              {/*  onClick={event => {*/}
              {/*    event.stopPropagation();*/}
              {/*    return resolveTask(task.bookingId, task.id);*/}
              {/*  }}*/}
              {/*  disabled={task.resolved}*/}
              {/*>*/}
              {/*  Resolve*/}
              {/*</Button>*/}
              <Chip
                size="small"
                label={`${
                  task.dueDate && task.dueDate < new Date() && !task.resolved
                    ? 'Overdue'
                    : task.resolved
                    ? 'Resolved'
                    : task.show
                    ? 'Pending'
                    : !task.show && task.dueDate
                    ? 'Future'
                    : 'Not Created yet'
                }`}
                style={{
                  backgroundColor:
                    task.dueDate && task.dueDate < new Date() && !task.resolved
                      ? '#f4364c'
                      : task.resolved
                      ? '#999999'
                      : task.show
                      ? '#00a2f2'
                      : !task.show && task.dueDate
                      ? '#3cb371'
                      : '#999999',
                  color: 'white',
                }}
              />
            </TableCell>
          </TableRow>
        ))}
      </ExpansionPanelDetails>
    </ExpansionPanel>
  );
};

export default BookingTaskExpansionPanel;

interface Props {
  tasks: Task[];
}
