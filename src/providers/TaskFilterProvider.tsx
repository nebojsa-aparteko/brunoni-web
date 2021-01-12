import React, { createContext, Dispatch, SetStateAction, useState } from 'react';
import useUser from '../hooks/useUser';
import { UserRecordMin } from '../model/UserRecord';
import { TaskStatus } from '../components/TaskStatusChip';
import { TaskCategory } from '../model/Task';
import Carrier from '../model/Carrier';

export interface TaskFilterProviderContextFilters {
  assignee?: UserRecordMin | undefined;
  showClientTasks: boolean;
  taskStatus: TaskStatus;
  taskCategory: TaskCategory;
  carrier?: Carrier;
  payDate?: Date;
}

export const TASK_FILTERS_INITIAL_STATE = {
  showClientTasks: false,
} as TaskFilterProviderContextFilters;

const TaskFilterProviderContext = createContext<
  [TaskFilterProviderContextFilters, Dispatch<SetStateAction<TaskFilterProviderContextFilters>> | undefined]
>([TASK_FILTERS_INITIAL_STATE, undefined]);

const TaskFilterProvider = (props: any) => {
  const userRecord = useUser()[1];

  const [state, setState] = useState<TaskFilterProviderContextFilters>({
    ...TASK_FILTERS_INITIAL_STATE,
    assignee: userRecord,
    taskCategory:
      userRecord && userRecord.lastOpenedChecklistTab && userRecord.lastOpenedChecklistTab === 'accounting'
        ? TaskCategory.ACCOUNTING
        : TaskCategory.OPERATIONS,
  });

  return (
    <TaskFilterProviderContext.Provider value={[state, setState]}>{props.children}</TaskFilterProviderContext.Provider>
  );
};

export const useTaskFilterProviderContext = () => {
  const context = React.useContext(TaskFilterProviderContext);
  if (context === undefined) {
    throw new Error('useTaskFilterProviderContext must be used within a TaskFilterProvider');
  }
  return context;
};

export default TaskFilterProvider;
