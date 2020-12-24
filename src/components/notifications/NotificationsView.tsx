import React, { useCallback, useContext } from 'react';
import {
  Box,
  Button,
  createStyles,
  Divider,
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
import { GlobalContext } from '../../store/GlobalStore';
import { useSnackbar } from 'notistack';

const useStyles = makeStyles(theme =>
  createStyles({
    root: {
      [theme.breakpoints.up('sm')]: {
        width: theme.spacing(50),
      },
      [theme.breakpoints.up('md')]: {
        width: theme.spacing(65),
      },
      [theme.breakpoints.up('lg')]: {
        width: theme.spacing(70),
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

const readAllNotifications = async (notifications: Notification[]) => {
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
};

const NotificationsView: React.FC<Props> = ({
  notifications,
  handleShow,
  filterByUnread,
  onFilterByUnread,
  onShowMore,
  numberToLoad,
}) => {
  const classes = useStyles();
  const { enqueueSnackbar } = useSnackbar();
  const [, dispatch] = useContext(GlobalContext);

  const markAllAsRead = useCallback(async () => {
    dispatch({ type: 'START_GLOBAL_LOADING' });
    readAllNotifications(notifications)
      .then(() =>
        enqueueSnackbar(<Typography color="inherit">Success.</Typography>, {
          variant: 'success',
        }),
      )
      .catch(error =>
        enqueueSnackbar(<Typography color="inherit">Error marking all notifications as read - {error}</Typography>, {
          variant: 'error',
        }),
      )
      .finally(() => dispatch({ type: 'STOP_GLOBAL_LOADING' }));
  }, [notifications]);

  return (
    <Grid className={classes.root}>
      <Box width="100%" flexDirection="column" justifyContent="center">
        <Box flex={1} display="flex" justifyContent="space-between" className={classes.titleRoot}>
          <Typography variant="subtitle1" className={classes.title} align="center">
            Notifications
          </Typography>
          <IconButton aria-label="close-button-notification-center" onClick={handleShow} className={classes.icon}>
            <CloseIcon />
          </IconButton>
        </Box>
        <Divider />
        <Box flex={1} display="flex" justifyContent="space-between">
          <Button onClick={onFilterByUnread}>{filterByUnread ? 'View all' : 'Filter by unread'}</Button>
          <Button onClick={markAllAsRead}>Mark all as read</Button>
        </Box>
        {notifications?.map(notification => (
          <ListItem key={notification.id}>
            <NotificationItemView notification={notification} handleShowDrawer={handleShow} />
          </ListItem>
        ))}
        {notifications.length == numberToLoad && (
          <Box display="flex" justifyContent="center">
            <Button onClick={onShowMore}>Show More</Button>
          </Box>
        )}
      </Box>
    </Grid>
  );
};

export default NotificationsView;
interface Props {
  notifications: Notification[];
  handleShow: () => void;
  filterByUnread: boolean;
  onFilterByUnread: () => void;
  onShowMore: () => void;
  numberToLoad: number;
}
