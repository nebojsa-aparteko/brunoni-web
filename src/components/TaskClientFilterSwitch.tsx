import React from 'react';
import { FormControlLabel, makeStyles, Switch } from '@material-ui/core';
import theme from '../theme';
import set from 'lodash/fp/set';
import { useTaskFilterProviderContext } from '../providers/TaskFilterProvider';

const useStyles = makeStyles(() => ({
  switchInput: {
    width: 0,
    left: 0,
  },
}));

const TaskClientFilterSwitch = () => {
  const [filters, setFilters] = useTaskFilterProviderContext();
  const { showClientTasks } = filters;
  const classes = useStyles();

  const changeShowClientTasks = (change: React.ChangeEvent<HTMLInputElement>) => {
    if (setFilters) setFilters(set('showClientTasks', change.target.checked || false)(filters));
  };
  return (
    <FormControlLabel
      style={{ marginLeft: theme.spacing(2) }}
      control={
        <Switch
          checked={showClientTasks}
          onChange={changeShowClientTasks}
          name="showClientTasks"
          color="primary"
          classes={{ input: classes.switchInput }}
        />
      }
      label="Show Client Tasks"
    />
  );
};

export default TaskClientFilterSwitch;
