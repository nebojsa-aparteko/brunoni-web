import { Box, Typography } from '@material-ui/core';
import React from 'react';
import { TaskDescription, TaskType } from '../../model/Task';

const makeTaskAlertText = (type: TaskType) => {
  return Object.entries(TaskDescription).find(t => t[0] === type)?.[1] || '-';
};

const TaskNotification: React.FC<Props> = ({ task }) => (
  <Box>
    <Typography>{makeTaskAlertText(task)}</Typography>
  </Box>
);

export default TaskNotification;

interface Props {
  task: TaskType;
}
