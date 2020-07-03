import React, { useState } from 'react';
import {
  Box,
  Button,
  Checkbox,
  ExpansionPanel,
  ExpansionPanelDetails,
  ExpansionPanelSummary,
  Link,
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
            <Box textAlign="left" width={'10%'}>
              <Checkbox
                checked={task.selected}
                onChange={event => {
                  event.stopPropagation();
                  task.selected = !task.selected;
                }}
                onFocus={event => event.stopPropagation()}
                // inputProps={{ 'aria-label': 'select all desserts' }}
              />
            </Box>
            <Box textAlign="left" width={'30%'}>
              <Typography variant="subtitle1">{Object.values(TaskDescription)[task.type] || '-'}</Typography>
            </Box>
            <Box textAlign="center" width={'15%'}>
              <Link target="_blank" href={`/bookings/${task.bookingId}`}>
                {task.bookingId}
              </Link>
            </Box>
            <Box textAlign="center" width={'20%'}>
              {task.assignedUser?.emailAddress || '-'}
            </Box>
            <Box textAlign="center" width={'15%'}>
              {task.dueDate ? formatDate(task.dueDate, 'yyyy-MM-dd HH:mm:ss') : '-'}
            </Box>
            <Box textAlign="center" width={'10%'}>
              <Button
                variant="outlined"
                onClick={event => {
                  event.stopPropagation();
                  // onResolve(task.bookingId, task.id);
                }}
                disabled={task.resolved}
              >
                Resolve
              </Button>
            </Box>
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
