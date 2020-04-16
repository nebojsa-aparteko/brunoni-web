import React from 'react';
import { Card, CardContent, CardHeader, Theme, Typography } from '@material-ui/core';
import WriteComment from './WriteComment';
import Comment from './Comment';
import { CommentEntity } from './ActivityModel';
import { makeStyles } from '@material-ui/core/styles';

interface Props {
  activityLog?: CommentEntity[];
  onCommentSave: (messageBody: string) => void;
}

const useStyles = makeStyles((theme: Theme) => ({
  spacing: {
    marginTop: theme.spacing(2),
  },
}));

const ActivityLogView: React.FC<Props> = ({ activityLog, onCommentSave }) => {
  const classes = useStyles();

  return (
    <Card className={classes.spacing}>
      <CardHeader title={<Typography variant="subtitle1">Activity</Typography>} />
      <CardContent>
        <WriteComment onCommentSave={onCommentSave} />
        {activityLog?.map(activity => (
          <Comment comment={activity} />
        ))}
      </CardContent>
    </Card>
  );
};

export default ActivityLogView;
