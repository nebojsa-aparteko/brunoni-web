import React from 'react';
import { Card, CardContent, CardHeader, Theme, Typography, FormControlLabel, Switch } from '@material-ui/core';
import WriteComment from './WriteComment';
import Comment from './Comment';
import { ActivityLogItem, ActivityType } from './ActivityModel';
import { makeStyles } from '@material-ui/core/styles';
import Activity from './Activity';

interface Props {
  activityLog?: ActivityLogItem[];
  onCommentSave: (messageBody: string) => void;
  showMore: boolean;
  onChange: () => void;
}

const useStyles = makeStyles((theme: Theme) => ({
  spacing: {
    marginTop: theme.spacing(2),
  },
}));

const ActivityLogView: React.FC<Props> = ({ activityLog, onCommentSave, showMore, onChange }) => {
  const classes = useStyles();

  return (
    <Card className={classes.spacing}>
      <CardHeader
        action={<Switch checked={showMore} onChange={onChange} name="showMore" color="primary" />}
        title={<Typography variant="subtitle1">Activity</Typography>}
      />
      <CardContent>
        <WriteComment onCommentSave={onCommentSave} />
        {activityLog?.map(activity =>
          activity.type === ActivityType.COMMENT ? <Comment comment={activity} /> : <Activity activity={activity} />,
        )}
      </CardContent>
    </Card>
  );
};

export default ActivityLogView;
