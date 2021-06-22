import React, { Fragment, useCallback, useMemo, useState } from 'react';
import { ActivityLogItem, ActivityType } from './ActivityModel';
import Comment from './Comment';
import Activity from './Activity';
import ActivityWithComment from './ActivityWithComment';
import { Booking } from '../../../model/Booking';
import { Box, createStyles, IconButton, makeStyles, Theme } from '@material-ui/core';
import Icon from '@mdi/react';
import { mdiPin, mdiPinOff } from '@mdi/js';
import firebase from '../../../firebase';
import { FirebaseActionType } from '../../../model/FirebaseAction';
import useGlobalAppState from '../../../hooks/useGlobalAppState';
import { SHOW_ERROR_SNACKBAR, SHOW_SUCCESS_SNACKBAR } from '../../../store/types/globalAppState';

export interface ActivityLogItemViewProps {
  activityItem: ActivityLogItem;
  booking?: Booking;
  pinnedCommentsCount?: number;
}

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    container: {
      display: 'flex',
      flexDirection: 'row',
      flex: 1,
      padding: theme.spacing(1),
    },
  }),
);

export const setIsPinned = (
  activityItemId: string,
  bookingId: string,
  isPinned: boolean,
  numberOfPinnedComments: number,
) =>
  firebase
    .firestore()
    .collection('bookings')
    .doc(bookingId)
    .collection('activity')
    .doc(activityItemId)
    .set({ isPinned: isPinned }, { merge: true })
    .then(() => updateTasksWithPinnedCommentsFlag(bookingId, numberOfPinnedComments + (isPinned ? 1 : -1)))
    .catch(err => console.error(err));

const updateTasksWithPinnedCommentsFlag = async (bookingId: string, numberOfPinnedComments: number) =>
  firebase
    .firestore()
    .collection('functions-action')
    .doc()
    .set({
      date: new Date(),
      type: FirebaseActionType.UPDATE_TASKS_WHEN_COMMENT_IS_PINNED,
      done: false,
      bookingId,
      numberOfPinnedComments,
    });

const ActivityLogItemView: React.FC<ActivityLogItemViewProps> = ({
  activityItem,
  booking,
  pinnedCommentsCount,
  ...other
}) => {
  const [showPinButton, setShowPinButton] = useState(false);
  const [, dispatch] = useGlobalAppState();
  const classes = useStyles();
  const cantPin = useMemo(() => pinnedCommentsCount === 2, [pinnedCommentsCount]);
  const handleSetIsPinned = useCallback(
    (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
      event.stopPropagation();

      if (booking?.id && activityItem.id) {
        setIsPinned(activityItem.id, booking?.id, !activityItem.isPinned, pinnedCommentsCount!)
          .then(() =>
            dispatch({
              type: SHOW_SUCCESS_SNACKBAR,
              message: `The activity has been ${activityItem.isPinned ? 'unpinned' : 'pinned'}.`,
            }),
          )
          .catch(error => dispatch({ type: SHOW_ERROR_SNACKBAR, message: `An error has occurred - ${error}` }));
      } else if (activityItem.path) {
        firebase
          .firestore()
          .doc(activityItem.path)
          .update('isPinned', !activityItem.isPinned)
          .then(() =>
            dispatch({
              type: SHOW_SUCCESS_SNACKBAR,
              message: `The activity has been ${activityItem.isPinned ? 'unpinned' : 'pinned'}.`,
            }),
          )
          .catch(error => dispatch({ type: SHOW_ERROR_SNACKBAR, message: `An error has occurred - ${error}` }));
      }
    },
    [activityItem, booking],
  );

  return (
    <Fragment {...other}>
      <Box
        className={classes.container}
        {...other}
        onMouseEnter={() => setShowPinButton(true)}
        onMouseLeave={() => setShowPinButton(false)}
      >
        {activityItem.type === ActivityType.COMMENT ? (
          <Comment activity={activityItem} booking={booking} />
        ) : activityItem.type === ActivityType.ACTIVITY_WITH_COMMENT ? (
          <ActivityWithComment activity={activityItem} />
        ) : (
          <Activity activity={activityItem} />
        )}
        {showPinButton && activityItem.type !== ActivityType.ACTIVITY ? (
          <Box display="flex" flexDirection="column">
            <IconButton
              edge="end"
              size="small"
              onClick={handleSetIsPinned}
              disabled={cantPin && !activityItem.isPinned}
            >
              {activityItem.isPinned ? (
                <Icon path={mdiPinOff} title="Unpin Comment" size={1} />
              ) : (
                <Icon path={mdiPin} title="Pin Comment" size={1} />
              )}
            </IconButton>
          </Box>
        ) : null}
      </Box>
    </Fragment>
  );
};

export default ActivityLogItemView;
