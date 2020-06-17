import React from 'react';
import { Box, Card, CardContent, CardHeader, Typography } from '@material-ui/core';
import ChartsCircularProgress from '../dashboard/ChartsCircularProgress';
import useTasks from '../../hooks/useTasks';
import MyDayTable from './MyDayTable';

const MyDayContainer = () => {
  const tasks = useTasks();
  return (
    <Card>
      <CardHeader
        title={
          <Box display="flex" alignItems="center">
            <Typography variant="subtitle1" display="inline">
              My Day
            </Typography>
          </Box>
        }
      />
      <CardContent>{tasks ? <MyDayTable tasks={tasks} /> : <ChartsCircularProgress />}</CardContent>
    </Card>
  );
};

export default MyDayContainer;
