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
import { Team } from '../../model/Teams';
import { ChecklistNames } from '../bookings/checklist/ChecklistItemModel';

const MyDayContainer = () => {
  const tasks = useTasks();
  const [filters, setFilters] = useTaskFilterProviderContext();
  const users = useAdminUsers();
  const [normalizedTasks, setNormalizedTasks] = useState<[string, Task[]][] | undefined>(undefined);
  const [teams, setTeams] = useState<Team[]>([]);
  //we use this only to render again after assigning users, because we dont work with live data
  const [assignedUserTrigger, setAssignedUserTrigger] = useState(false);
  const [selectedTasks, setSelectedTasks] = useState<string[]>([]);
  const onSelectRow = useCallback(
    (id: string) =>
      setSelectedTasks(prevState =>
        selectedTasks.includes(id) ? [...prevState.filter(t => t !== id)] : [...prevState, id],
      ),
    [selectedTasks],
  );

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
    if (assignee && !actingAs)
      getTeamsPerUser(assignee).then(fbTeams => {
        setTeams(
          fbTeams.docs.map(doc => {
            return { id: doc.id, ...doc.data() } as Team;
          }) as Team[],
        );
      });
  }, [assignee, actingAs]);

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
                    ?.map(carrier => getId(carrier.name) || carrier.name)
                    .findIndex(carrier => carrier === task.carrierId?.toUpperCase()) !== -1 &&
                  currentValue.categories?.findIndex(category => category === task.category) !== -1 &&
                  (!task.assignedUser || !task.assignedUser.alphacomId),
              ),
          ] as [string, Task[]];
          return [...p, newTuple];
        }, Promise.resolve([] as [string, Task[]][]))
        .then(n => setNormalizedTasks(n || []));
    }
  }, [teams, setNormalizedTasks, assignedUserTrigger]);

  const onStatusFilter = useCallback(
    (_, status) => {
      if (setFilters) setFilters(set('taskStatus', status || undefined)(filters));
    },
    [filters],
  );

  /*
    Overdue / Future, make array of filter functions, and add that function into filter function of an array
   */
  const filteredTasks = useMemo(() => (taskStatus ? tasks?.filter(getTaskFilter(taskStatus)) : tasks), [
    taskStatus,
    tasks,
    getTaskFilter,
  ]);

  const onAssignUser = useCallback(() => {
    selectedTasks.forEach(id => {
      const teamTasks = id.split('-');
      const [bookingId, taskId] = teamTasks[0].split('/');

      firebase
        .firestore()
        .collection('bookings')
        .doc(bookingId)
        .collection('tasks')
        .doc(taskId)
        .update('assignedUser', pick(UserRecordMinProperties)(assignTo))
        .then(() => {
          setSelectedTasks([]);
          setAssignedUserTrigger(prevState => !prevState);
        });
    });
  }, [selectedTasks, assignTo, pick, UserRecordMinProperties]);
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
        {!actingAs && (
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
        )}
        {filteredTasks && normalizedTasks ? (
          <MyDayTable
            tasks={filteredTasks}
            normalizedTasks={normalizedTasks}
            shouldShowTeamTasks={!!(assignee && assignee.alphacomId)}
            selectedTasks={selectedTasks}
            onSelectRow={onSelectRow}
            updateComponent={() => setAssignedUserTrigger(prevState => !prevState)}
          />
        ) : (
          <ChartsCircularProgress />
        )}
      </CardContent>
    </Card>
  );
};

export default MyDayContainer;

const getTeamTasks = (checklistItems: string[]) => {
  const stages: ChecklistNames[] = [];
  const checklists: ChecklistNames[] = [];
  checklistItems.forEach(c => {
    const ch = getChecklistItem(c as ChecklistNames);
    if (ch.checklistStageId) {
      stages.push(ch.checklistStageId);
    }
    checklists.push(ch.checklistId);
  });
  return stages.length > 0
    ? firebase
        .firestore()
        .collectionGroup('tasks')
        .where('checklistStageId', 'in', stages)
        .where('resolved', '==', false)
        .where('show', '==', true)
        .where('userRole', '==', UserRole.ADMIN)
        .get()
    : firebase
        .firestore()
        .collectionGroup('tasks')
        .where('checklistId', 'in', checklistItems)
        .where('resolved', '==', false)
        .where('show', '==', true)
        .where('userRole', '==', UserRole.ADMIN)
        .get();
};

export const getTeamsPerUser = (assignee: UserRecord) =>
  firebase
    .firestore()
    .collection('teams')
    .where('users', 'array-contains', pick(UserRecordMinProperties)(assignee))
    .get();

const getChecklistItem = (item: ChecklistNames): ChecklistItemType => {
  const chkitem = checklistItemsWithStages.find(checklistItem => checklistItem.checklistStageId === item);
  return chkitem ? chkitem : { checklistId: item };
};

const checklistItemsWithStages: ChecklistItemType[] = [
  { checklistId: ChecklistNames.B_L, checklistStageId: ChecklistNames.BL_DRAFT_CREATE },
  { checklistId: ChecklistNames.B_L, checklistStageId: ChecklistNames['BL_DRAFT_APPROVED '] },
  { checklistId: ChecklistNames.B_L, checklistStageId: ChecklistNames['BL_DRAFT_SENT '] },
  { checklistId: ChecklistNames.B_L, checklistStageId: ChecklistNames['FINAL_BL_COPY '] },
  { checklistId: ChecklistNames.OOG, checklistStageId: ChecklistNames.OOG_APPROVED },
  { checklistId: ChecklistNames.OOG, checklistStageId: ChecklistNames.OOG_REQUESTED },
  { checklistId: ChecklistNames.IMO, checklistStageId: ChecklistNames.IMO_REQUESTED },
  { checklistId: ChecklistNames.IMO, checklistStageId: ChecklistNames.IMO_APPROVED },
  { checklistId: ChecklistNames.IMO, checklistStageId: ChecklistNames.FINAL_DGD_SHEET },
  { checklistId: ChecklistNames.IMO, checklistStageId: ChecklistNames.INFORMED_PORT },
];

interface ChecklistItemType {
  checklistId: ChecklistNames;
  checklistStageId?: ChecklistNames;
}
const getId = (carrierName: string) => {
  return carrierIds[carrierName.toLowerCase()];
};
const carrierIds = {
  ['Hamburg Süd'.toLowerCase()]: 'Hamburg Süd'.toUpperCase(),
  ['HMM'.toLowerCase()]: 'HMM',
  ['Hugo Stinnes'.toLowerCase()]: 'STNN',
  ['MACS'.toLowerCase()]: 'MACS',
  ['Sloman Neptun'.toLowerCase()]: 'SLOM',
  ['UAL'.toLowerCase()]: 'UAL',
  ['DAL'.toLowerCase()]: 'DAL',
  ['ZIM LINE'.toLowerCase()]: 'ZIM',
  ['SETH SHIPPING'.toLowerCase()]: 'SETH SHIPPING',
  ['Gold Star Line'.toLowerCase()]: 'GSL',
  ['UAFL'.toLowerCase()]: 'UAFL',
  ['VAN UDEN'.toLowerCase()]: 'VAN UDEN',
  ['WAIVER SERVICE'.toLowerCase()]: 'WAIVER SERVICE',
  ['DAL DEUTSCHE AFRIKA-LINIEN'.toLowerCase()]: 'DAL',
  ['UAFL UNITED AFRICA FEEDER LINE'.toLowerCase()]: 'UAFL',
};
