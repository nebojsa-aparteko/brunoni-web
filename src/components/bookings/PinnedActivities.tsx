import React, { useState } from 'react';
import { ActivityLogItem, ActivityType } from './checklist/ActivityModel';
import Comment from './checklist/Comment';
import ActivityWithComment from './checklist/ActivityWithComment';
import Activity from './checklist/Activity';
import { Booking } from '../../model/Booking';
import { Box, IconButton, Paper } from '@material-ui/core';
import { mdiPinOff, mdiStarCircleOutline } from '@mdi/js';
import Icon from '@mdi/react';
import { setIsPinned } from './checklist/ActivityLogItemView';
import firebase from '../../firebase';
import { SHOW_ERROR_SNACKBAR, SHOW_SUCCESS_SNACKBAR } from '../../store/types/globalAppState';
import useGlobalAppState from '../../hooks/useGlobalAppState';

const PinnedActivities: React.FC<Props> = ({ pinnedActivities, booking, collection, docId }) => {
  const [showUnpinButtonForActivity, setShowUnpinButtonForActivity] = useState<
    string | undefined
  >();
  const [, dispatch] = useGlobalAppState();
  const handleUnpin = (
    event: React.MouseEvent<HTMLButtonElement, MouseEvent>,
    activity: ActivityLogItem,
  ) => {
    event.stopPropagation();
    if (booking?.id && activity.id) {
      setIsPinned(activity.id, 'bookings', booking?.id, false, pinnedActivities.length)
        .then(() =>
          dispatch({
            type: SHOW_SUCCESS_SNACKBAR,
            message: `The activity has been ${activity.isPinned ? 'unpinned' : 'pinned'}.`,
          }),
        )
        .catch(error =>
          dispatch({ type: SHOW_ERROR_SNACKBAR, message: `An error has occurred - ${error}` }),
        );
    } else if (collection && docId && activity.id) {
      setIsPinned(activity.id, collection, docId, false, pinnedActivities.length)
        .then(() =>
          dispatch({
            type: SHOW_SUCCESS_SNACKBAR,
            message: `The activity has been ${activity.isPinned ? 'unpinned' : 'pinned'}.`,
          }),
        )
        .catch(error =>
          dispatch({ type: SHOW_ERROR_SNACKBAR, message: `An error has occurred - ${error}` }),
        );
    } else if (activity.path) {
      firebase
        .firestore()
        .doc(activity.path)
        .update('isPinned', false)
        .then(() =>
          dispatch({
            type: SHOW_SUCCESS_SNACKBAR,
            message: `The activity has been ${activity.isPinned ? 'unpinned' : 'pinned'}.`,
          }),
        )
        .catch(error =>
          dispatch({ type: SHOW_ERROR_SNACKBAR, message: `An error has occurred - ${error}` }),
        );
    }
  };

  return (
    <Paper
      style={{
        display: 'flex',
        flexDirection: 'row',
        backgroundColor: 'rgba(198, 238, 241, 0.24)',
        padding: 16,
      }}
    >
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

export default PinnedActivities;

interface Props {
  pinnedActivities: ActivityLogItem[];
  booking?: Booking;
  collection?: string;
  docId?: string;
}
