import React, { useMemo, useState } from 'react';
import { Box, Button, Card, CardContent, CardHeader, Typography } from '@material-ui/core';
import ChartsCircularProgress from '../dashboard/ChartsCircularProgress';
import useTasks from '../../hooks/useTasks';
import MyDayTable from './MyDayTable';
import firebase from '../../firebase';
import UserInput from '../inputs/UserInput';
import set from 'lodash/fp/set';
import TaskFilterProvider, { useTaskFilterProviderContext } from '../../providers/TaskFilterProvider';
import useAdminUsers from '../../hooks/useAdminUsers';
import theme from '../../theme';
import { UserRecordMin, UserRecordMinProperties } from '../../model/UserRecord';
import pick from 'lodash/fp/pick';
const resolveTask = (bookingId: string, taskId: string) =>
  firebase
    .firestore()
    .collection('bookings')
    .doc(bookingId)
    .collection('tasks')
    .doc(taskId)
    .update('resolved', true);

const MyDayContainer = () => {
  const tasks = useTasks();
  const [filters, setFilters] = useTaskFilterProviderContext();
  const users = useAdminUsers();
  const { assignee } = filters;
  const [assignTo, setAssignTo] = useState<UserRecordMin | undefined>(undefined);

  return (
    <Card>
      <CardHeader
        title={
          <Box display="flex" alignItems="center" justifyContent="space-between">
            <Typography variant="subtitle1" display="inline">
              My Day
            </Typography>
            <Box display="flex" style={{ minWidth: theme.spacing(35) }}>
              <UserInput
                label="Assigned user"
                users={users}
                onChange={(_, user) => {
                  console.log(user);
                  if (setFilters) setFilters(set('assignee', user || undefined)(filters));
                }}
                value={assignee}
              />
            </Box>
          </Box>
        }
      />
      <CardContent>
        <Box display="flex" flexDirection="row">
          <Box display="flex" style={{ minWidth: theme.spacing(35) }} mr={1}>
            <UserInput
              label="Assign task to"
              users={users}
              onChange={(_, user) => {
                console.log(user);
                setAssignTo(user || undefined);
              }}
              value={assignTo}
            />
          </Box>
          <Button
            color="primary"
            variant="contained"
            onClick={event => {
              // console.log(tasks?.filter(task => task.selected));
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
        {tasks ? <MyDayTable tasks={tasks} onResolve={resolveTask} /> : <ChartsCircularProgress />}
      </CardContent>
    </Card>
  );
};

export default MyDayContainer;
