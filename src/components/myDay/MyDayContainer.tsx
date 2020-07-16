import React, { useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { Box, Button, Card, CardContent, CardHeader, Typography } from '@material-ui/core';
import ChartsCircularProgress from '../dashboard/ChartsCircularProgress';
import useTasks, { normalizeTaskData } from '../../hooks/useTasks';
import MyDayTable from './MyDayTable';
import firebase from '../../firebase';
import UserInput from '../inputs/UserInput';
import set from 'lodash/fp/set';
import { useTaskFilterProviderContext } from '../../providers/TaskFilterProvider';
import useAdminUsers from '../../hooks/useAdminUsers';
import theme from '../../theme';
import UserRecord, { UserRecordMin, UserRecordMinProperties } from '../../model/UserRecord';
import pick from 'lodash/fp/pick';
import ActingAs from '../../contexts/ActingAs';
import TaskClientFilterSwitch from '../TaskClientFilterSwitch';
import TaskStatusInput from '../tasks/TaskStatusInput';
import { getTaskFilter } from '../TaskStatusChip';
import Task, { UserRole } from '../../model/Task';
import { BookingCategory } from '../../model/Booking';
import useTeams from '../../hooks/useTeams';
import { cloneDeep } from 'lodash/fp';
import { Team } from '../../model/Teams';
import safeInvoke from '../../utilities/safeInvoke';

const MyDayContainer = () => {
  const tasks = useTasks();
  const [filters, setFilters] = useTaskFilterProviderContext();
  const users = useAdminUsers();
  const [normalizedTasks, setNormalizedTasks] = useState<[string, Task[]][] | undefined>(undefined);
  const [teams, setTeams] = useState<Team[]>([]);
  const { assignee, taskStatus } = filters;
  const [assignTo, setAssignTo] = useState<UserRecordMin | undefined>(undefined);
  const actingAs = useContext(ActingAs)[0];
  const onAssignedFilter = useCallback(
    (_, user) => {
      if (setFilters) setFilters(set('assignee', user || undefined)(filters));
    },
    [filters],
  );

  useEffect(() => {
    if (assignee)
      getTeamsPerUser(assignee).then(fbTeams => {
        setTeams(
          fbTeams.docs.map(doc => {
            return { id: doc.id, ...doc.data() } as Team;
          }) as Team[],
        );
      });
  }, [assignee]);

  useEffect(() => {
    if (teams) {
      teams
        ?.reduce(async (previousValue, currentValue) => {
          const tasksPerTeam = await getTeamTasks(currentValue.checklistItems!);

          const p = await previousValue;
          const newTuple = [
            currentValue.name as string,
            tasksPerTeam.docs
              .map(
                task =>
                  ({
                    ...normalizeTaskData(task.data()),
                    bookingId: task.ref.parent.parent?.id,
                    id: task.id,
                    selected: false,
                  } as Task),
              )
              .filter(
                task =>
                  currentValue.carriers
                    ?.map(carrier => carrier.name)
                    .findIndex(carrier => carrier === task.carrierId?.toUpperCase()) !== -1 &&
                  currentValue.categories?.findIndex(category => category === task.category) !== -1 &&
                  (!task.assignedUser || !task.assignedUser.alphacomId),
              ),
          ] as [string, Task[]];
          return [...p, newTuple];
        }, Promise.resolve([] as [string, Task[]][]))
        .then(n => setNormalizedTasks(n || []));
    }
  }, [teams, setNormalizedTasks]);

  const onStatusFilter = useCallback(
    (_, status) => {
      if (setFilters) setFilters(set('taskStatus', status || undefined)(filters));
    },
    [filters],
  );

  /*
    Overdue / Future, make array of filter functions, and add that function into filter function of an array
   */
  const filteredTasks = useMemo(() => {
    console.log('Counting status');
    if (taskStatus) {
      console.log(tasks?.filter(getTaskFilter(taskStatus)));
    }
    return taskStatus ? tasks?.filter(getTaskFilter(taskStatus)) : tasks;
  }, [taskStatus, tasks, getTaskFilter]);

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
            <Box display="flex" style={{ minWidth: theme.spacing(35) }} ml={2}>
              <TaskStatusInput
                label="Task status"
                onChange={onStatusFilter}
                tasksStatus={['Overdue', 'Pending']}
                value={taskStatus}
              />
            </Box>
          </Box>
        </Box>
        {filteredTasks ? (
          <MyDayTable
            tasks={filteredTasks}
            normalizedTasks={normalizedTasks}
            shouldShowTeamTasks={!!(assignee && assignee.alphacomId)}
          />
        ) : (
          <ChartsCircularProgress />
        )}
      </CardContent>
    </Card>
  );
};

export default MyDayContainer;

const getTeamTasks = (checklistItems: string[]) =>
  firebase
    .firestore()
    .collectionGroup('tasks')
    .where('checklistId', 'in', checklistItems)
    .where('resolved', '==', false)
    .where('show', '==', true)
    .where('userRole', '==', UserRole.ADMIN)
    .orderBy('assignedUser')
    .get();

const getTeamsPerUser = (assignee: UserRecord) =>
  firebase
    .firestore()
    .collection('teams')
    .where('users', 'array-contains', pick(UserRecordMinProperties)(assignee))
    .get();
