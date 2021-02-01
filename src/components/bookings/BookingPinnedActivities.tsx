import React from 'react';
import { ActivityLogItem, ActivityType } from './checklist/ActivityModel';
import Comment from './checklist/Comment';
import ActivityWithComment from './checklist/ActivityWithComment';
import Activity from './checklist/Activity';
import { Booking } from '../../model/Booking';
import { Box, Paper } from '@material-ui/core';
import { mdiStarCircleOutline } from '@mdi/js';
import Icon from '@mdi/react';

const BookingPinnedActivities: React.FC<Props> = ({ pinnedActivities, booking }) => {
  return (
    <Paper style={{ display: 'flex', flexDirection: 'row', backgroundColor: 'rgba(198, 238, 241, 0.24)', padding: 16 }}>
      <Box display="flex" p={2}>
        <Icon
          path={mdiStarCircleOutline}
          title="Pinned Activities"
          size={1.5}
          color="orange"
          style={{ margin: 'auto' }}
        />
      </Box>
      <Box flex={1}>
        {pinnedActivities.map(activity =>
          activity.type === ActivityType.COMMENT ? (
            <Comment key={activity.id} activity={activity} booking={booking} />
          ) : activity.type === ActivityType.ACTIVITY_WITH_COMMENT ? (
            <ActivityWithComment key={activity.id} activity={activity} />
          ) : (
            <Activity key={activity.id} activity={activity} />
          ),
        )}
      </Box>
    </Paper>
  );
};

export default BookingPinnedActivities;

interface Props {
  pinnedActivities: ActivityLogItem[];
  booking: Booking;
}
