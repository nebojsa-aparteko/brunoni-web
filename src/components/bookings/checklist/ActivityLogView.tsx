import React from 'react';
import { Card, CardContent, CardHeader, makeStyles, Switch, Theme, Typography } from '@material-ui/core';
import WriteComment from './WriteComment';
import { ActivityLogItem } from './ActivityModel';
import { MentionItem } from 'react-mentions';
import ActivityLogItemView from './ActivityLogItemView';
import { ActivityLogProvider } from './ActivityLogContext';

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
          <ActivityLogProvider>
            <WriteComment onCommentSave={onCommentSave} />
          </ActivityLogProvider>
        ) : (
          <WriteComment onCommentSave={onCommentSave} />
        )}
        {activityLog?.map((activity: ActivityLogItem) => (
          <ActivityLogItemView activityItem={activity} key={`act-${activity.id}`} />
        ))}
      </CardContent>
    </Card>
  );
};

export default ActivityLogView;
