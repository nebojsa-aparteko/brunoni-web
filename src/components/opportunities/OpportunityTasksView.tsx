import React, {
  Fragment,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { Card, CardContent, makeStyles, Paper, Typography } from '@material-ui/core';
import Meta from '../Meta';
import ChartsCircularProgress from '../dashboard/ChartsCircularProgress';
import OpportunityTasksTable from './OpportunityTasksTable';
import OpportunityTasksFiltersBar from './OpportunityTasksFiltersBar';
import useUser from '../../hooks/useUser';
import { isDashboardUser, CUSTOMER_FACING_ROLES } from '../../model/UserRecord';
import firebase from '../../firebase';
import { NormalizedOpportunity, TaskStatus } from '../../model/Opportunity';
import UserRecord from '../../model/UserRecord';
import useOverdueTasksCount from '../../hooks/useOverdueTasksCount';
import useAdminUsers from '../../hooks/useAdminUsers';
import UserRecordContext from '../../contexts/UserRecordContext';

const useStyles = makeStyles(theme => ({
  root: {
    marginTop: theme.spacing(4),
    marginBottom: theme.spacing(4),
    padding: theme.spacing(5),

    [theme.breakpoints.down('sm')]: {
      padding: theme.spacing(2),
      paddingTop: theme.spacing(3),
    },

    ['@media print']: {
      marginTop: theme.spacing(0),
      paddingTop: theme.spacing(0),
    },
  },
  content: {
    padding: 0,
    overflowX: 'auto',
    width: 1200,
  },
  inner: {
    minWidth: 700,
  },
}));

export interface OpportunityTask {
  id?: string;
  content: string;
  assignedTo: string;
  dueDate: Date;
  status: TaskStatus;
  opportunityId: string;
  createdAt: Date;
  updatedAt: Date;
  createdBy?: string;
  assignedToUser?: UserRecord;
  opportunity?: NormalizedOpportunity;
}

export interface OpportunityTasksFilters {
  assignedUser: UserRecord | null | undefined;
  fileNumber: string;
}

const OpportunityTasksView: React.FC = () => {
  const classes = useStyles();
  const [, userRecord] = useUser();
  const currentUser = useContext(UserRecordContext);
  const [tasks, setTasks] = useState<OpportunityTask[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filters, setFilters] = useState<OpportunityTasksFilters>({
    assignedUser: currentUser || undefined,
    fileNumber: '',
  });
  const { refreshCount } = useOverdueTasksCount();
  const users = useAdminUsers(CUSTOMER_FACING_ROLES);
  const isInitialLoad = useRef(true);

  // Set default user only on initial load, not when manually cleared
  useEffect(() => {
    if (currentUser && isInitialLoad.current) {
      setFilters(prev => ({ ...prev, assignedUser: currentUser }));
      isInitialLoad.current = false;
    }
  }, [currentUser]);

  const filteredTasks = useMemo(() => {
    return tasks.filter(task => {
      if (task.status === TaskStatus.Discarded) {
        return false;
      }

      if (
        filters.assignedUser &&
        filters.assignedUser.id &&
        task.assignedTo !== filters.assignedUser.id
      ) {
        return false;
      }

      if (filters.fileNumber && task.opportunity?.opportunityId) {
        const searchTerm = filters.fileNumber.toLowerCase();
        const fileNumber = task.opportunity.opportunityId.toLowerCase();
        if (!fileNumber.includes(searchTerm)) {
          return false;
        }
      }

      return true;
    });
  }, [tasks, filters]);

  const handleResolveTask = useCallback(
    async (taskId: string) => {
      try {
        await firebase.firestore().collection('opportunity-tasks').doc(taskId).update({
          status: TaskStatus.Resolved,
          updatedAt: new Date(),
        });

        setTasks(prevTasks =>
          prevTasks.map(task =>
            task.id === taskId
              ? { ...task, status: TaskStatus.Resolved, updatedAt: new Date() }
              : task,
          ),
        );

        refreshCount();
      } catch (error) {
        console.error('Failed to resolve task:', error);
      }
    },
    [refreshCount],
  );

  const handleDiscardTask = useCallback(
    async (taskId: string) => {
      try {
        await firebase.firestore().collection('opportunity-tasks').doc(taskId).update({
          status: TaskStatus.Discarded,
          updatedAt: new Date(),
        });

        // Update local state immediately
        setTasks(prevTasks =>
          prevTasks.map(task =>
            task.id === taskId
              ? { ...task, status: TaskStatus.Discarded, updatedAt: new Date() }
              : task,
          ),
        );

        // Refresh badge count
        refreshCount();
      } catch (error) {
        console.error('Failed to discard task:', error);
      }
    },
    [refreshCount],
  );

  const fetchTasks = useCallback(async () => {
    if (!userRecord?.id) return;

    setIsLoading(true);
    try {
      const db = firebase.firestore();
      let query = db.collection('opportunity-tasks');

      // Filter tasks based on user role
      if (!isDashboardUser(userRecord)) {
        // Non-admin users only see tasks assigned to them or created by them
        query = query.where('assignedTo', '==', userRecord.id);
      }
      // Admin users see all tasks (no additional filtering)

      const snapshot = await query.orderBy('createdAt', 'desc').get();

      const tasksData: OpportunityTask[] = [];
      const userIds = new Set<string>();
      const opportunityIds = new Set<string>();

      // Collect task data and unique IDs
      const rawTasks = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate(),
        updatedAt: doc.data().updatedAt?.toDate(),
        dueDate: doc.data().dueDate?.toDate(),
      })) as OpportunityTask[];

      rawTasks.forEach(task => {
        if (task.assignedTo) userIds.add(task.assignedTo);
        if (task.createdBy) userIds.add(task.createdBy);
        if (task.opportunityId) opportunityIds.add(task.opportunityId);
      });

      // Fetch user records
      const userPromises = Array.from(userIds).map(async userId => {
        const userDoc = await db.collection('users').doc(userId).get();
        return { id: userId, ...userDoc.data() } as UserRecord & { id: string };
      });

      // Fetch opportunity records
      const opportunityPromises = Array.from(opportunityIds).map(async oppId => {
        const oppDoc = await db.collection('opportunities').doc(oppId).get();
        return { id: oppId, ...oppDoc.data() } as NormalizedOpportunity & { id: string };
      });

      const [users, opportunities] = await Promise.all([
        Promise.all(userPromises),
        Promise.all(opportunityPromises),
      ]);

      const usersMap = new Map(users.map(user => [user.id, user]));
      const opportunitiesMap = new Map(opportunities.map(opp => [opp.id, opp]));

      // Enrich tasks with user and opportunity data
      rawTasks.forEach(task => {
        const enrichedTask = {
          ...task,
          assignedToUser: task.assignedTo ? usersMap.get(task.assignedTo) : undefined,
          opportunity: task.opportunityId ? opportunitiesMap.get(task.opportunityId) : undefined,
        };
        tasksData.push(enrichedTask);
      });

      setTasks(tasksData);
    } catch (error) {
      console.error('Failed to fetch opportunity tasks:', error);
    } finally {
      setIsLoading(false);
    }
  }, [userRecord]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  return (
    <Fragment>
      <Meta title="Opportunity Tasks" />

      <div>
        {!isLoading ? (
          <Fragment>
            <Card>
              <CardContent>
                <OpportunityTasksFiltersBar
                  filters={filters}
                  setFilters={setFilters}
                  users={users}
                />
              </CardContent>

              {filteredTasks.length === 0 ? (
                <CardContent>
                  <Typography
                    variant="body1"
                    style={{ textAlign: 'center', padding: 32, color: '#666' }}
                  >
                    {tasks.length === 0
                      ? isDashboardUser(userRecord)
                        ? 'No opportunity tasks found.'
                        : 'No tasks assigned to you at the moment.'
                      : 'No tasks match the current filters.'}
                  </Typography>
                </CardContent>
              ) : (
                <CardContent className={classes.content}>
                  <OpportunityTasksTable
                    tasks={filteredTasks}
                    isAdmin={isDashboardUser(userRecord)}
                    onResolve={handleResolveTask}
                    onDiscard={handleDiscardTask}
                  />
                </CardContent>
              )}
            </Card>
          </Fragment>
        ) : (
          <Paper className={classes.root}>
            <ChartsCircularProgress />
          </Paper>
        )}
      </div>
    </Fragment>
  );
};

export default OpportunityTasksView;
