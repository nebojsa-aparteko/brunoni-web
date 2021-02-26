import React, { useState } from 'react';
import { ActivityLogItem, ActivityType } from './checklist/ActivityModel';
import Comment from './checklist/Comment';
import ActivityWithComment from './checklist/ActivityWithComment';
import Activity from './checklist/Activity';
import { Booking } from '../../model/Booking';
import { Box, IconButton, Paper, Typography } from '@material-ui/core';
import { mdiPinOff, mdiStarCircleOutline } from '@mdi/js';
import Icon from '@mdi/react';
import { setIsPinned } from './checklist/ActivityLogItemView';
import { useSnackbar } from 'notistack';

const BookingPinnedActivities: React.FC<Props> = ({ pinnedActivities, booking }) => {
  const [showUnpinButtonForActivity, setShowUnpinButtonForActivity] = useState<string | undefined>(undefined);
  const { enqueueSnackbar } = useSnackbar();

  const handleUnpin = (event: React.MouseEvent<HTMLButtonElement, MouseEvent>, activity: ActivityLogItem) => {
    event.stopPropagation();
    if (booking?.id && activity.id)
      setIsPinned(activity.id, booking?.id, false, pinnedActivities.length)
        .then(() =>
          enqueueSnackbar(<Typography color="inherit">{`The activity has been unpinned successfully.`}</Typography>, {
            variant: 'success',
          }),
        )
        .catch(error =>
          enqueueSnackbar(<Typography color="inherit">{`An error has occurred - ` + error}</Typography>, {
            variant: 'error',
          }),
        );
  };

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
        {pinnedActivities.map(activity => (
          <Box
            key={activity.id}
            display="flex"
            flexDirection="row"
            onMouseEnter={() => setShowUnpinButtonForActivity(activity.id)}
            onMouseLeave={() => setShowUnpinButtonForActivity(undefined)}
          >
            {activity.type === ActivityType.COMMENT ? (
              <Comment activity={activity} booking={booking} />
            ) : activity.type === ActivityType.ACTIVITY_WITH_COMMENT ? (
              <ActivityWithComment activity={activity} />
            ) : (
              <Activity activity={activity} />
            )}
            {showUnpinButtonForActivity && showUnpinButtonForActivity === activity.id && (
              <IconButton
                edge="end"
                size="small"
                aria-label=""
                onClick={event => handleUnpin(event, activity)}
                style={{ margin: 'auto' }}
              >
                <Icon path={mdiPinOff} title="Unpin Comment" size={1} />
              </IconButton>
            )}
          </Box>
        ))}
      </Box>
    </Paper>
  );
};

export default BookingPinnedActivities;

interface Props {
  pinnedActivities: ActivityLogItem[];
  booking: Booking;
}
