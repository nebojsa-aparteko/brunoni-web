import React, { Fragment, useState } from 'react';
import { ActivityLogItem, ActivityType } from './ActivityModel';
import Comment from './Comment';
import Activity from './Activity';
import ActivityWithComment from './ActivityWithComment';
import { Booking } from '../../../model/Booking';
import { Box, createStyles, IconButton, makeStyles, Theme, Typography } from '@material-ui/core';
import Icon from '@mdi/react';
import { mdiPin, mdiPinOff } from '@mdi/js';
import firebase from '../../../firebase';
import { useSnackbar } from 'notistack';

export interface ActivityLogItemViewProps {
  activityItem: ActivityLogItem;
  booking?: Booking;
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

const setIsPinned = (activityItemId: string, bookingId: string, isPinned: boolean) =>
  firebase
    .firestore()
    .collection('bookings')
    .doc(bookingId)
    .collection('activity')
    .doc(activityItemId)
    .set({ isPinned: isPinned }, { merge: true });

const ActivityLogItemView: React.FC<ActivityLogItemViewProps> = ({ activityItem, booking, ...other }) => {
  const [showPinButton, setShowPinButton] = useState(false);
  const { enqueueSnackbar } = useSnackbar();
  const classes = useStyles();

  const handleSetIsPinned = (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    event.stopPropagation();
    if (booking?.id && activityItem.id)
      setIsPinned(activityItem.id, booking?.id, !activityItem.isPinned)
        .then(() =>
          enqueueSnackbar(
            <Typography color="inherit">
              {`The activity has been ${activityItem.isPinned ? 'unpinned' : 'pinned'}.`}
            </Typography>,
            { variant: 'success' },
          ),
        )
        .catch(error =>
          enqueueSnackbar(<Typography color="inherit">{`An error has occurred - ` + error}</Typography>, {
            variant: 'error',
          }),
        );
  };

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
        {showPinButton && booking && activityItem.type !== ActivityType.ACTIVITY ? (
          <Box display="flex" flexDirection="column">
            <IconButton edge="end" size="small" aria-label="" onClick={handleSetIsPinned}>
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
