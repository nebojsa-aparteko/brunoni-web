import React, { useCallback } from 'react';
import { Box, Button, createStyles, Divider, IconButton, makeStyles, Typography } from '@material-ui/core';
import NotificationItemView from './NotificationItemView';
import Notification from '../../model/Notification';
import CloseIcon from '@material-ui/icons/Close';
import firebase from 'firebase';

const useStyles = makeStyles(theme =>
  createStyles({
    root: {
      width: 500,
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

const NotificationsView: React.FC<Props> = ({ notifications, handleShow }) => {
  const classes = useStyles();
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
            await firebase
              .firestore()
              .collection('email-notifications')
              .doc(notification.userAlphacomId)
              .set({
                lastSend: sentNotifications.lastSend,
                notifications: sentNotifications.notifications.filter(u => u !== notification.id),
              });
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
    <Box display="flex" flexDirection="column" justifyContent="center" className={classes.root}>
      <Box display="flex" justifyContent="space-between" className={classes.titleRoot}>
        <Typography variant="subtitle1" className={classes.title} align="center">
          Notifications
        </Typography>
        <IconButton aria-label="close-button-notification-center" onClick={handleShow} className={classes.icon}>
          <CloseIcon />
        </IconButton>
      </Box>
      <Divider />
      <Box display="flex" justifyContent="flex-end">
        <Button onClick={markAllAsRead}>Mark all as read</Button>
      </Box>
      {notifications?.map(notification => (
        <NotificationItemView notification={notification} key={notification.id} handleShowDrawer={handleShow} />
      ))}
    </Box>
  );
};

export default NotificationsView;
interface Props {
  notifications: Notification[];
  handleShow: () => void;
}
