import React from 'react';
import { Box, Typography } from '@material-ui/core';
import Avatar from 'react-avatar';
import formatDistanceToNow from 'date-fns/formatDistanceToNow';
import { ActivityLogItem } from './ActivityModel';

const Activity = ({ activity }: Props) => (
  <Box display="flex" flexDirection="row" mx={1} my={2} alignContent="center">
    <Avatar
      name={`${activity.by.firstName} ${activity.by.lastName}`}
      title={`${activity.by.firstName} ${activity.by.lastName}`}
      size="40"
      round={true}
    />
    <Box display="flex" flexDirection="column" ml={1}>
      <Typography variant="body1">{activity.comment}</Typography>
      <Typography color="textSecondary" variant="caption">{`${formatDistanceToNow(activity.at)} ago`}</Typography>
    </Box>
  </Box>
);

export default Activity;

interface Props {
  activity: ActivityLogItem;
}
