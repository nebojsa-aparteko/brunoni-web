import React from 'react';
import { FormControlLabel, Switch } from '@material-ui/core';
import theme from '../theme';
import set from 'lodash/fp/set';
import { useTaskFilterProviderContext } from '../providers/TaskFilterProvider';

const TaskClientFilterSwitch = () => {
  const [filters, setFilters] = useTaskFilterProviderContext();
  const { showClientTasks } = filters;

  const changeShowClientTasks = (change: React.ChangeEvent<HTMLInputElement>) => {
    if (setFilters) setFilters(set('showClientTasks', change.target.checked || false)(filters));
  };
  return (
    <FormControlLabel
      style={{ marginRight: theme.spacing(2) }}
      control={
        <Switch checked={showClientTasks} onChange={changeShowClientTasks} name="showClientTasks" color="primary" />
      }
      label="Show Client Tasks"
    />
  );
};

export default TaskClientFilterSwitch;
