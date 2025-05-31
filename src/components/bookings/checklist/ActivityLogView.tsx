import React, { useLayoutEffect } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  FormControlLabel,
  makeStyles,
  Switch,
  Theme,
  Typography,
} from '@material-ui/core';
import WriteComment from './WriteComment';
import { ActivityLogItem } from './ActivityModel';
import { MentionItem } from 'react-mentions';
import ActivityLogItemView from './ActivityLogItemView';
import { ActivityLogProvider } from './ActivityLogContext';
import { Booking } from '../../../model/Booking';
import { Quote } from '../../../providers/QuoteGroupsProvider';
import { useNavigate } from 'react-router-dom';
import queryString from 'query-string';
import { BookingRequest } from '../../../model/BookingRequest';
import List from '@material-ui/core/List';

interface Props {
  activityLog?: ActivityLogItem[];
  quoteActivityLog?: boolean;
  onCommentSave: (messageBody: string, mentions: MentionItem[], internal: boolean) => void;
  showMore?: boolean;
  onChange?: () => void;
  booking?: Booking;
  quote?: Quote;
  bookingRequest?: BookingRequest;
  isAccounting?: boolean;
  pinnedCommentsCount?: number;
}

const useStyles = makeStyles((theme: Theme) => ({
  spacing: {
    marginTop: theme.spacing(2),
  },
  cardContent: {
    padding: 0,
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
  bookingRequest,
  isAccounting,
  pinnedCommentsCount,
}) => {
  const classes = useStyles();
  const navigate = useNavigate();

  useLayoutEffect(() => {
    setTimeout(() => {
      const params = queryString.parse(window.location.search.replace('?', ''));
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
        navigate(`${window.location.pathname}?${queryString.stringify(params)}`, { replace: true });
      }
    }, 1000);
  }, [navigate]);

  return (
    <Card id="activityLog" className={classes.spacing} style={{ overflow: 'unset' }}>
      <CardHeader
        action={
          !quoteActivityLog ? (
            <FormControlLabel
              id="activityToggleActivityLog"
              control={
                <Switch checked={showMore} onChange={onChange} name="showMore" color="primary" />
              }
              label="Show Activity"
              labelPlacement="start"
            />
          ) : null
        }
        title={<Typography variant="subtitle1">Activity</Typography>}
      />
      <CardContent className={classes.cardContent}>
        {quoteActivityLog ? (
          <ActivityLogProvider>
            <WriteComment onCommentSave={onCommentSave} quote={quote} />
          </ActivityLogProvider>
        ) : booking ? (
          <WriteComment
            onCommentSave={onCommentSave}
            booking={booking}
            isAccounting={isAccounting}
          />
        ) : (
          bookingRequest && (
            <WriteComment onCommentSave={onCommentSave} bookingRequest={bookingRequest} />
          )
        )}
        <List>
          {booking
            ? activityLog?.map((activity: ActivityLogItem) => (
                <div id={activity.id} key={`act-${activity.id}`}>
                  <ActivityLogItemView
                    activityItem={activity}
                    booking={booking}
                    pinnedCommentsCount={pinnedCommentsCount}
                  />
                </div>
              ))
            : (bookingRequest || quote) &&
              activityLog?.map((activity: ActivityLogItem) => (
                <div id={activity.id} key={`act-${activity.id}`}>
                  <ActivityLogItemView activityItem={activity} />
                </div>
              ))}
        </List>
      </CardContent>
    </Card>
  );
};

export default ActivityLogView;
