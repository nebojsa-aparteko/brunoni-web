import React, { useCallback, useEffect, useState } from 'react';
import {
  Box,
  Button,
  Checkbox,
  createStyles,
  Divider,
  FormControlLabel,
  Grid,
  IconButton,
  ListItem,
  makeStyles,
  Typography,
} from '@material-ui/core';
import NotificationItemView from './NotificationItemView';
import Notification from '../../model/Notification';
import CloseIcon from '@material-ui/icons/Close';
import firebase from '../../firebase';

const useStyles = makeStyles(theme =>
  createStyles({
    root: {
      [theme.breakpoints.up('sm')]: {
        maxWidth: theme.spacing(50),
      },
      [theme.breakpoints.up('md')]: {
        maxWidth: theme.spacing(65),
      },
      [theme.breakpoints.up('lg')]: {
        maxWidth: theme.spacing(70),
      },
    },
    title: {
      margin: theme.spacing(1),
      color: 'white',
    },
    titleRoot: {
      backgroundColor: '#3c4858',
    },
    icon: {
      color: 'white',
    },
  }),
);

const notificationsSort = (a: Notification, b: Notification) => {
  if (a.seen === b.seen) {
    if (a.at > b.at) {
      return -1;
    } else {
      return 1;
    }
  } else {
    if (a.seen) return 1;
    else return -1;
  }
};

const NotificationsView: React.FC<Props> = ({ notifications, handleShow }) => {
  const [showOnlyUnread, setShowOnlyUnread] = useState(true);
  const [sortedNotifications, setSortedNotifications] = useState<Notification[] | undefined>(
    notifications
      ? showOnlyUnread
        ? notifications.filter(notification => !notification.seen).sort((a, b) => notificationsSort(a, b))
        : notifications.sort((a, b) => notificationsSort(a, b))
      : undefined,
  );
  const classes = useStyles();

  useEffect(() => {
    setSortedNotifications(
      notifications
        ? showOnlyUnread
          ? notifications.filter(notification => !notification.seen).sort((a, b) => notificationsSort(a, b))
          : notifications.sort((a, b) => notificationsSort(a, b))
        : undefined,
    );
  }, [notifications, showOnlyUnread]);

  const markAllAsRead = useCallback(() => {
    (async () => {
      const batch = firebase.firestore().batch();
      await Promise.all(
        notifications
          ?.filter(notification => !notification.seen)
          .map(async notification => {
            const sentNotifications = (
              await firebase
                .firestore()
                .collection('email-notifications')
                .doc(notification.userAlphacomId)
                .get()
            ).data() as {
              lastSend: Date;
              notifications: string[];
            };
            if (sentNotifications) {
              await firebase
                .firestore()
                .collection('email-notifications')
                .doc(notification.userAlphacomId)
                .set({
                  lastSend: sentNotifications.lastSend,
                  notifications: sentNotifications.notifications.filter(u => u !== notification.id),
                });
            }
            return batch.update(
              firebase
                .firestore()
                .collection('notifications')
                .doc(notification.id),
              { seen: true },
            );
          }),
      );
      batch.commit().catch(err => console.log(err));
    })();
  }, [notifications]);
  return (
    <Grid xs={12} className={classes.root}>
      <Box flexDirection="column" justifyContent="center">
        <Box display="flex" justifyContent="space-between" className={classes.titleRoot}>
          <Typography variant="subtitle1" className={classes.title} align="center">
            Notifications
          </Typography>
          <IconButton aria-label="close-button-notification-center" onClick={handleShow} className={classes.icon}>
            <CloseIcon />
          </IconButton>
        </Box>
        <Divider />
        <Box display="flex" justifyContent="space-between">
          <FormControlLabel
            control={<Checkbox checked={showOnlyUnread} onChange={() => setShowOnlyUnread(!showOnlyUnread)} />}
            label="Show only unread"
            style={{ paddingLeft: 12 }}
          />
          <Button onClick={markAllAsRead}>Mark all as read</Button>
        </Box>
        {sortedNotifications?.map(notification => (
          <ListItem key={notification.id}>
            <NotificationItemView notification={notification} handleShowDrawer={handleShow} />
          </ListItem>
        ))}
      </Box>
    </Grid>
  );
};

export default NotificationsView;
interface Props {
  notifications: Notification[];
  handleShow: () => void;
}
