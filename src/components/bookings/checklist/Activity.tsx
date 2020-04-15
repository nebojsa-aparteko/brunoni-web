import React from 'react';
import { Box, Typography } from '@material-ui/core';
import { CommentEntity } from './Comments';
import Avatar from 'react-avatar';
import formatDistanceToNow from 'date-fns/formatDistanceToNow';

const Activity = ({ activity }: Props) => (
  <Box display="flex" flexDirection="row" m={1}>
    <Avatar
      name={`${activity.commentedBy.firstName} ${activity.commentedBy.lastName}`}
      title={`${activity.commentedBy.firstName} ${activity.commentedBy.lastName}`}
      size="40"
      round={true}
    />
    <Box flexDirection="column" ml={1}>
      <Typography variant="body1">{activity.text}</Typography>
      <Typography color="textSecondary" variant="caption">{`${formatDistanceToNow(
        activity.commentedAt,
      )} ago`}</Typography>
    </Box>
  </Box>
);

export default Activity;

interface Props {
  activity: CommentEntity;
}
