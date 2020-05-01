import React from 'react';
import { Card, CardContent, CardHeader, makeStyles, Switch, Theme, Typography } from '@material-ui/core';
import WriteComment from './WriteComment';
import Comment from './Comment';
import { ActivityLogItem, ActivityType } from './ActivityModel';
import Activity from './Activity';
import { MentionItem } from 'react-mentions';
import QuoteWriteComment from '../../activities/QuoteWriteComment';

interface Props {
  activityLog?: ActivityLogItem[];
  quoteActivityLog?: boolean;
  onCommentSave: (messageBody: string, mentions: MentionItem[], internal: boolean) => void;
  showMore?: boolean;
  onChange?: () => void;
}

const useStyles = makeStyles((theme: Theme) => ({
  spacing: {
    marginTop: theme.spacing(2),
  },
}));

const ActivityLogView: React.FC<Props> = ({ activityLog, onCommentSave, showMore, onChange, quoteActivityLog }) => {
  const classes = useStyles();

  return (
    <Card className={classes.spacing}>
      <CardHeader
        action={
          !quoteActivityLog ? <Switch checked={showMore} onChange={onChange} name="showMore" color="primary" /> : null
        }
        title={<Typography variant="subtitle1">Activity</Typography>}
      />
      <CardContent>
        {quoteActivityLog ? (
          <QuoteWriteComment onCommentSave={onCommentSave} />
        ) : (
          <WriteComment onCommentSave={onCommentSave} />
        )}
        {activityLog?.map((activity: any) =>
          activity.type === ActivityType.COMMENT ? (
            <Comment comment={activity} key={activity.id} />
          ) : (
            <Activity activity={activity} key={activity.id} />
          ),
        )}
      </CardContent>
    </Card>
  );
};

export default ActivityLogView;
