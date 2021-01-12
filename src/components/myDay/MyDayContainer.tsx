import React, { useCallback, useContext, useEffect, useMemo, useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  CardHeader,
  FormControlLabel,
  Grid,
  Radio,
  RadioGroup,
  Typography,
} from '@material-ui/core';
import ChartsCircularProgress from '../dashboard/ChartsCircularProgress';
import useTasks, { normalizeTaskData } from '../../hooks/useTasks';
import MyDayTable from './MyDayTable';
import firebase from '../../firebase';
import UserInput from '../inputs/UserInput';
import set from 'lodash/fp/set';
import { useTaskFilterProviderContext } from '../../providers/TaskFilterProvider';
import useAdminUsers from '../../hooks/useAdminUsers';
import theme from '../../theme';
import UserRecord, { UserRecordMinProperties } from '../../model/UserRecord';
import pick from 'lodash/fp/pick';
import ActingAs from '../../contexts/ActingAs';
import TaskClientFilterSwitch from '../TaskClientFilterSwitch';
import TaskStatusInput from '../tasks/TaskStatusInput';
import { getTaskFilter } from '../TaskStatusChip';
import Task, { TaskCategory, UserRole } from '../../model/Task';
import { Team, TeamType } from '../../model/Teams';
import { ChecklistNames } from '../bookings/checklist/ChecklistItemModel';
import { showCrispChat } from '../../index';
import PaymentOverviewDialog from '../finance/PaymentOverviewDialog';
import CarrierInput from '../inputs/CarrierInput';
import Carriers from '../../contexts/Carriers';
import Carrier from '../../model/Carrier';
import { GlobalContext } from '../../store/GlobalStore';
import DateInput from '../inputs/DateInput';
import ClearIcon from '@material-ui/icons/Clear';
import IconButton from '@material-ui/core/IconButton';
import { startOfDay } from 'date-fns/fp';

const MyDayContainer = () => {
  const tasks = useTasks();
  const [filters, setFilters] = useTaskFilterProviderContext();
  const users = useAdminUsers();
  const [normalizedTasks, setNormalizedTasks] = useState<[string, Task[]][] | undefined>(undefined);
  const [teams, setTeams] = useState<Team[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isPayDatePickerOpen, setIsPayDatePickerOpen] = useState(false);
  const [payDate, setPayDate] = useState<Date | null>(null);
  const [openBooking, setOpenBooking] = useState<string | undefined>(undefined);
  const [, dispatch] = useContext(GlobalContext);

  //we use this only to render again after assigning users, because we dont work with live data
  const [assignedUserTrigger, setAssignedUserTrigger] = useState(false);
  const [selectedTasks, setSelectedTasks] = useState<string[]>([]);
  const onSelectRow = useCallback(
    (event: React.MouseEvent<HTMLElement>, id: string) => {
      event.stopPropagation();
      setSelectedTasks(prevState =>
        selectedTasks.includes(id) ? [...prevState.filter(t => t !== id)] : [...prevState, id],
      );
    },
    [selectedTasks],
  );

  const { assignee, taskStatus, taskCategory, carrier } = filters;
  const actingAs = useContext(ActingAs)[0];
  const availableCarriers = useContext(Carriers);
  const onAssignedFilter = useCallback(
    (_, user) => {
      if (setFilters) {
        setSelectedTasks([]);
        setFilters(set('assignee', user || undefined)(filters));
      }
    },
    [filters, setFilters],
  );

  const filteredTeams = useMemo(() => teams?.filter(t => t.teamType === taskCategory.toLowerCase()), [
    teams,
    taskCategory,
  ]);

  useEffect(() => {
    //calling this only once on load
    if (setFilters) {
      setFilters(
        set('taskCategory', (localStorage.getItem('taskCategory') as TaskCategory) || TaskCategory.OPERATIONS)(filters),
      );
    }
  }, []);

  useEffect(() => {
    if (assignee && !actingAs)
      getTeamsPerUser(assignee).then(fbTeams => {
        setSelectedTasks([]);
        setTeams(
          fbTeams.docs.map(doc => {
            return { id: doc.id, ...doc.data() } as Team;
          }) as Team[],
        );
      });
  }, [assignee, actingAs]);

  useEffect(() => {
    if (filteredTeams) {
      filteredTeams
        ?.reduce(async (previousValue, currentValue) => {
          dispatch({ type: 'START_GLOBAL_LOADING' });
          const tasksPerTeam =
            (await currentValue.teamType) === TeamType.OPERATIONS
              ? await getOperationsTeamTasks(currentValue.checklistItems || [], formatCarrierId(carrier?.id))
              : await getAccountingTeamTasks(currentValue.taskTypes || [], formatCarrierId(carrier?.id));
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
                  (payDate && task.payDate ? startOfDay(task.payDate) === startOfDay(payDate) : true) &&
                  (!task.assignedUser || !task.assignedUser.alphacomId),
              ),
          ] as [string, Task[]];
          return [...p, newTuple];
        }, Promise.resolve([] as [string, Task[]][]))
        .then(n => {
          dispatch({ type: 'STOP_GLOBAL_LOADING' });
          setNormalizedTasks(n || []);
        });
    }
  }, [filteredTeams, setNormalizedTasks, assignedUserTrigger, carrier?.name, payDate]);

  const onStatusFilter = useCallback(
    (_, status) => {
      if (setFilters) {
        setSelectedTasks([]);
        setFilters(set('taskStatus', status || undefined)(filters));
      }
    },
    [filters, setFilters],
  );

  const onCarrierFilter = useCallback(
    (carrier: Carrier | null | undefined) => {
      if (setFilters) {
        setSelectedTasks([]);
        setFilters(set('carrier', carrier || undefined)(filters));
      }
    },
    [filters, setFilters],
  );

  const onCategoryChange = useCallback(
    (category: TaskCategory) => {
      if (setFilters) {
        setSelectedTasks([]);
        setFilters(set('taskCategory', category)(filters));
        localStorage.setItem('taskCategory', `${category}`);
      }
    },
    [filters, setFilters],
  );

  const onPayDateChange = useCallback(
    date => {
      setPayDate(date);
      setIsPayDatePickerOpen(false);
      if (setFilters) {
        setSelectedTasks([]);
        setFilters(set('payDate', date ? startOfDay(date) : undefined)(filters));
      }
    },
    [filters, setFilters],
  );

  /*
    Overdue / Future, make array of filter functions, and add that function into filter function of an array
   */
  const filteredTasks = useMemo(() => (taskStatus ? tasks?.filter(getTaskFilter(taskStatus)) : tasks), [
    taskStatus,
    tasks,
  ]);

  const filteredNormalizedTasks = useMemo(
    () =>
      taskStatus
        ? (normalizedTasks?.map(normalizedTask => [
            normalizedTask[0],
            normalizedTask[1].filter(getTaskFilter(taskStatus)),
          ]) as [string, Task[]][] | undefined)
        : normalizedTasks,
    [taskStatus, normalizedTasks],
  );

  const selectDeselectAll = () => {
    //check if the length of selected tasks is equal to the number of all tasks
    const filteredTasksLength: number = filteredTasks?.length || 0;
    const normalizedTasksLength: number = normalizedTasks
      ? normalizedTasks?.reduce((prev, current) => prev + current[1].length, 0)
      : 0;
    if (selectedTasks.length !== filteredTasksLength + normalizedTasksLength) {
      const filteredTasksSelection = filteredTasks?.map(task => `${task.bookingId}/${task.id}`) || [];
      const normalizedTasksSelection = normalizedTasks
        ? normalizedTasks.map(normalizedTask =>
            normalizedTask[1].map(task => `${task.bookingId}/${task.id}-${normalizedTask[0]}`),
          )
        : [];

      setSelectedTasks(filteredTasksSelection.concat(normalizedTasksSelection.flat()));
    } else {
      setSelectedTasks([]);
    }
  };

  const handleDialogClose = useCallback(() => {
    showCrispChat(true);
    setIsDialogOpen(false);
    setOpenBooking(undefined);
  }, [setIsDialogOpen]);

  const handleDialogOpen = useCallback(
    (bookingId: string) => {
      showCrispChat(false);
      setIsDialogOpen(true);
      setOpenBooking(bookingId);
    },
    [setIsDialogOpen],
  );

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
          <Box display="flex" flexDirection="row" mb={2} justifyContent="flex-start" flexWrap="wrap">
            <Box display="flex" alignItems="center" mb={2}>
              <Box style={{ minWidth: 'fit-content', alignItems: 'center' }}>
                <TaskClientFilterSwitch setSelectedTasks={setSelectedTasks} />
              </Box>
            </Box>
            <Box display="flex" alignItems="center" mb={2}>
              <Box display="flex" style={{ minWidth: theme.spacing(45), alignItems: 'center' }} ml={2}>
                <Typography variant="h4" display="block" style={{ minWidth: 'fit-content', paddingRight: 4 }}>
                  Filter by:
                </Typography>
                <UserInput label="Assigned user" users={users} onChange={onAssignedFilter} value={assignee} />
              </Box>
              <Box display="flex" style={{ minWidth: theme.spacing(15) }} ml={2}>
                <TaskStatusInput
                  label="Task status"
                  onChange={onStatusFilter}
                  tasksStatus={['Overdue', 'Pending']}
                  value={taskStatus}
                />
              </Box>
              <Box display="flex" style={{ minWidth: theme.spacing(15) }} ml={2}>
                <CarrierInput label="Carrier" onChange={onCarrierFilter} carriers={availableCarriers} value={carrier} />
              </Box>
              {taskCategory === TaskCategory.ACCOUNTING ? (
                <Box display="flex" style={{ minWidth: theme.spacing(15), display: 'flex' }} ml={2}>
                  <DateInput
                    value={payDate}
                    onChange={onPayDateChange}
                    open={isPayDatePickerOpen}
                    onOpen={() => setIsPayDatePickerOpen(true)}
                    onClose={() => setIsPayDatePickerOpen(false)}
                    label="Pay date"
                  />
                  {payDate ? (
                    <IconButton
                      aria-label="cancel"
                      onClick={event => {
                        event.stopPropagation();
                        onPayDateChange(null);
                      }}
                      size="small"
                      style={{ position: 'relative', right: 32, marginRight: -32, height: 32, alignSelf: 'center' }}
                    >
                      <ClearIcon />
                    </IconButton>
                  ) : null}
                </Box>
              ) : null}
            </Box>
            <Box display="flex" alignItems="center" mb={2} pl={4}>
              <Typography component="div">
                <Grid component="label" container alignItems="center" spacing={1}>
                  <Grid item>
                    <RadioGroup
                      aria-label="taskCategory"
                      name="taskCategory"
                      value={taskCategory}
                      onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                        onCategoryChange(event.target.value as TaskCategory);
                      }}
                      style={{ flexDirection: 'row' }}
                    >
                      <FormControlLabel value={TaskCategory.OPERATIONS} control={<Radio />} label="Operations" />
                      <FormControlLabel value={TaskCategory.ACCOUNTING} control={<Radio />} label="Accounting" />
                    </RadioGroup>
                  </Grid>
                </Grid>
              </Typography>
            </Box>
          </Box>
        )}
        {filteredTasks && normalizedTasks ? (
          <MyDayTable
            tasks={filteredTasks}
            normalizedTasks={filteredNormalizedTasks}
            shouldShowTeamTasks={!!(assignee && assignee.alphacomId)}
            selectedTasks={selectedTasks}
            setSelectedTasks={setSelectedTasks}
            trigger={() => setAssignedUserTrigger(prevState => !prevState)}
            onSelectRow={onSelectRow}
            updateComponent={() => setAssignedUserTrigger(prevState => !prevState)}
            taskCategory={taskCategory}
            handleOpenPreviewDialog={handleDialogOpen}
            handleSelectDeselectAll={selectDeselectAll}
          />
        ) : (
          <ChartsCircularProgress />
        )}
        {isDialogOpen && (
          <PaymentOverviewDialog
            isOpen={isDialogOpen}
            handleClose={handleDialogClose}
            bookingId={openBooking}
            updateComponent={() => setAssignedUserTrigger(prevState => !prevState)}
          />
        )}
      </CardContent>
    </Card>
  );
};

export default MyDayContainer;

const getOperationsTeamTasks = (checklistItems: string[], carrierId: string | undefined) => {
  const stages: ChecklistNames[] = [];
  checklistItems.forEach(c => {
    const ch = getChecklistItem(c as ChecklistNames);
    if (ch.checklistStageId) {
      stages.push(ch.checklistStageId);
    }
  });
  let query = firebase.firestore().collectionGroup('tasks');
  if (carrierId) query = query.where('carrierId', '==', carrierId);
  return stages.length > 0
    ? query
        .where('checklistStageId', 'in', stages)
        .where('resolved', '==', false)
        .where('show', '==', true)
        .where('userRole', '==', UserRole.ADMIN)
        .get()
    : query
        .where('checklistId', 'in', checklistItems)
        .where('resolved', '==', false)
        .where('show', '==', true)
        .where('userRole', '==', UserRole.ADMIN)
        .get();
};

const getAccountingTeamTasks = (taskTypes: string[], carrierId: string | undefined) => {
  let query = firebase.firestore().collectionGroup('tasks');
  if (carrierId) query = query.where('carrierId', '==', carrierId);
  return query
    .where('type', 'in', taskTypes)
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

export const formatCarrierId = (carrierId: string | undefined) => {
  return carrierId
    ? carrierId === 'HSG'
      ? 'Hamburg Süd'
      : carrierId === 'SLOM'
      ? 'SLOMAN NEPTUN'
      : carrierId
    : undefined;
};

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
