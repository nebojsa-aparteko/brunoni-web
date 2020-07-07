import React, { useCallback, useContext, useState } from 'react';
import { Box, Button, Card, CardContent, CardHeader, Typography } from '@material-ui/core';
import ChartsCircularProgress from '../dashboard/ChartsCircularProgress';
import useTasks from '../../hooks/useTasks';
import MyDayTable from './MyDayTable';
import firebase from '../../firebase';
import UserInput from '../inputs/UserInput';
import set from 'lodash/fp/set';
import { useTaskFilterProviderContext } from '../../providers/TaskFilterProvider';
import useAdminUsers from '../../hooks/useAdminUsers';
import theme from '../../theme';
import { UserRecordMin, UserRecordMinProperties } from '../../model/UserRecord';
import pick from 'lodash/fp/pick';
import ActingAs from '../../contexts/ActingAs';
import TaskClientFilterSwitch from '../TaskClientFilterSwitch';

const MyDayContainer = () => {
  const tasks = useTasks();
  const [filters, setFilters] = useTaskFilterProviderContext();
  const users = useAdminUsers();
  const { assignee } = filters;
  const [assignTo, setAssignTo] = useState<UserRecordMin | undefined>(undefined);
  const actingAs = useContext(ActingAs)[0];
  const onAssignedFilter = useCallback(
    (_, user) => {
      if (setFilters) setFilters(set('assignee', user || undefined)(filters));
    },
    [filters],
  );
  const onAssignUser = useCallback(() => {
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
  }, [tasks, assignTo, pick, UserRecordMinProperties]);
  return (
    <Card>
      <CardHeader
        title={
          <Box display="flex" alignItems="center" justifyContent="space-between">
            <Typography variant="h3" display="inline">
              My Day
            </Typography>
          </Box>
        }
      />
      <CardContent>
        <Box display="flex" flexDirection="row" mb={2} justifyContent="space-between">
          <Box display="flex">
            <Box display="flex" style={{ minWidth: theme.spacing(35) }} mr={1}>
              <UserInput
                label="Assign task to"
                users={users}
                onChange={(_, user) => {
                  setAssignTo(user || undefined);
                }}
                value={assignTo}
              />
            </Box>
            <Button color="primary" variant="contained" onClick={onAssignUser}>
              Assign user
            </Button>
          </Box>

          <Box display="flex" alignItems="center">
            {!actingAs && <TaskClientFilterSwitch />}
            <Typography variant="h4" display="inline">
              Filter by:
            </Typography>
            <Box display="flex" style={{ minWidth: theme.spacing(35) }} ml={2}>
              <UserInput label="Assigned user" users={users} onChange={onAssignedFilter} value={assignee} />
            </Box>
          </Box>
        </Box>
        {tasks ? <MyDayTable tasks={tasks} /> : <ChartsCircularProgress />}
      </CardContent>
    </Card>
  );
};

export default MyDayContainer;
