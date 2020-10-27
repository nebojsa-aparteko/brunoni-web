import React, { useLayoutEffect } from 'react';
import { Box, Card, CardContent, CardHeader, makeStyles, Switch, Theme, Typography } from '@material-ui/core';
import WriteComment from './WriteComment';
import { ActivityLogItem } from './ActivityModel';
import { MentionItem } from 'react-mentions';
import ActivityLogItemView from './ActivityLogItemView';
import { ActivityLogProvider } from './ActivityLogContext';
import { Booking } from '../../../model/Booking';
import { Quote } from '../../../providers/QuoteGroupsProvider';
import { useHistory } from 'react-router-dom';
import QueryString from 'querystring';

interface Props {
  activityLog?: ActivityLogItem[];
  quoteActivityLog?: boolean;
  onCommentSave: (messageBody: string, mentions: MentionItem[], internal: boolean) => void;
  showMore?: boolean;
  onChange?: () => void;
  booking?: Booking;
  quote?: Quote;
  isAccounting?: boolean;
}

const useStyles = makeStyles((theme: Theme) => ({
  spacing: {
    marginTop: theme.spacing(2),
  },
}));

const ActivityLogView: React.FC<Props> = ({
  activityLog,
  onCommentSave,
  showMore,
  onChange,
  quoteActivityLog,
  booking,
  quote,
  isAccounting,
}) => {
  const classes = useStyles();
  const history = useHistory();

  useLayoutEffect(() => {
    setTimeout(() => {
      const params = QueryString.parse(window.location.search.replace('?', ''));
      if (params.focusComment) {
        const activityId = params.focusComment as string;
        //read that notification
        if (!window.location.search || window.location.search === '' || !activityId) return;
        const element = window.document.getElementById(activityId);
        if (!element) return;
        element.scrollIntoView();
        element.animate(
          [
            { backgroundColor: '#ffffff' },
            { backgroundColor: 'rgba(255,198,30,0.77)' },
            { backgroundColor: '#ffffff' },
          ],
          {
            duration: 1500,
            fill: 'backwards',
            iterations: 6,
          },
        );
        delete params.focusComment;
        history.replace(`${window.location.pathname}?${QueryString.stringify(params)}`);
      }
    }, 1000);
  }, [history]);

  return (
    <Card className={classes.spacing} style={{ overflow: 'unset' }}>
      <CardHeader
        action={
          !quoteActivityLog ? <Switch checked={showMore} onChange={onChange} name="showMore" color="primary" /> : null
        }
        title={<Typography variant="subtitle1">Activity</Typography>}
      />
      <CardContent>
        {quoteActivityLog ? (
          <ActivityLogProvider>
            <WriteComment onCommentSave={onCommentSave} quote={quote} />
          </ActivityLogProvider>
        ) : (
          <WriteComment onCommentSave={onCommentSave} booking={booking} isAccounting={isAccounting} />
        )}
        {activityLog?.map((activity: ActivityLogItem) => (
          <Box id={activity.id} key={`act-${activity.id}`}>
            <ActivityLogItemView activityItem={activity} />
          </Box>
        ))}
      </CardContent>
    </Card>
  );
};

export default ActivityLogView;
