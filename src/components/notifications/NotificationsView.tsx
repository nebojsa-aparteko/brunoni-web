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
import { FirebaseActionType } from '../../model/FirebaseAction';
import useUser from '../../hooks/useUser';

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

const readAllNotifications = async (userEmail: string, userAlphacomId: string) =>
  firebase
    .firestore()
    .collection('functions-action')
    .doc()
    .set({
      date: new Date(),
      type: FirebaseActionType.MARK_ALL_NOTIFICATIONS_AS_READ,
      done: false,
      userEmail,
      userAlphacomId,
    });

const NotificationsView: React.FC<Props> = ({
  notifications,
  handleShow,
  filterByUnread,
  onFilterByUnread,
  onShowMore,
  numberToLoad,
}) => {
  const classes = useStyles();
  const [, dispatch] = useContext(GlobalContext);
  const [, userRecord] = useUser();
  const markAllAsRead = useCallback(async () => {
    dispatch({ type: 'START_GLOBAL_LOADING' });
    if (!userRecord.emailAddress) return;
    readAllNotifications(userRecord.emailAddress, userRecord.alphacomId)
      .then(() => {
        handleShow();
        dispatch({ type: 'SHOW_SUCCESS_SNACKBAR', message: 'Success.' });
      })
      .catch(error =>
        dispatch({ type: 'SHOW_ERROR_SNACKBAR', message: `Error marking all notifications as read - ${error}` }),
      )
      .finally(() => dispatch({ type: 'STOP_GLOBAL_LOADING' }));
  }, [dispatch, userRecord, handleShow]);

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
        {notifications && notifications.length === 0 && filterByUnread ? (
          <Box flex={1} display="flex">
            <Box display="flex" flexDirection="column" margin="auto" padding={2}>
              <Typography style={{ padding: 2 }}>You don't have any unread notifications.</Typography>
              <Button variant="contained" onClick={onFilterByUnread} style={{ margin: 'auto' }}>
                View all
              </Button>
            </Box>
          </Box>
        ) : (
          <React.Fragment>
            <Box flex={1} display="flex" justifyContent="space-between">
              <Button onClick={onFilterByUnread}>{filterByUnread ? 'View all' : 'Filter by unread'}</Button>
              <Button onClick={markAllAsRead}>Mark all as read</Button>
            </Box>
            {notifications?.map(notification => (
              <ListItem key={notification.id}>
                <NotificationItemView notification={notification} handleShowDrawer={handleShow} />
              </ListItem>
            ))}
            {notifications.length === numberToLoad && (
              <Box display="flex" justifyContent="center">
                <Button onClick={onShowMore}>Show More</Button>
              </Box>
            )}
          </React.Fragment>
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
