import React, { Fragment, useCallback, useContext } from 'react';
import {
  Box,
  Button,
  Card,
  CardActions,
  CardContent,
  CardHeader,
  Chip,
  createStyles,
  IconButton,
  makeStyles,
  Menu,
  MenuItem,
  Typography,
} from '@material-ui/core';
import Comment from '../bookings/checklist/Comment';
import Notification, { NotificationType } from '../../model/Notification';
import { useHistory } from 'react-router';
import Activity from '../bookings/checklist/Activity';
import Alert from './Alert';
import RadioButtonCheckedIcon from '@material-ui/icons/RadioButtonChecked';
import RadioButtonUncheckedIcon from '@material-ui/icons/RadioButtonUnchecked';
import TaskNotification from './TaskNotification';
import DateFormattedText from '../DateFormattedText';
import InfoNotification from './InfoNotification';
import MoreVertIcon from '@material-ui/icons/MoreVert';
import ActingAs from '../../contexts/ActingAs';
import firebase from '../../firebase';
import ActivityWithComment from '../bookings/checklist/ActivityWithComment';
import { useSnackbar } from 'notistack';
import { GlobalContext } from '../../store/GlobalStore';
import UserRecord from '../../model/UserRecord';
import useUser from '../../hooks/useUser';
import { FirebaseActionType } from '../../model/FirebaseAction';

const useStyles = makeStyles(theme =>
  createStyles({
    root: {
      margin: theme.spacing(2),
      width: '100%',
    },
    header: {
      marginRight: theme.spacing(1),
    },
    titleAnchor: {
      textDecoration: 'underline',
    },
  }),
);

const NotificationTitle: React.FC<NotificationTitleProps> = ({ notification, handleClick }) => {
  const classes = useStyles();
  return (
    <Fragment>
      <Chip
        size="small"
        label={`${
          notification.type === NotificationType.COMMENT
            ? 'Comment'
            : notification.type === NotificationType.ACTIVITY ||
              notification.type === NotificationType.ACTIVITY_WITH_COMMENT
            ? 'Activity'
            : notification.type === NotificationType.ALERT
            ? 'Alert'
            : notification.type === NotificationType.TASK
            ? 'Task'
            : 'Info'
        }`}
        style={{
          backgroundColor:
            notification.type === NotificationType.COMMENT
              ? '#3cb371'
              : notification.type === NotificationType.ACTIVITY ||
                notification.type === NotificationType.ACTIVITY_WITH_COMMENT
              ? '#00a2f2'
              : notification.type === NotificationType.ALERT
              ? '#f4364c'
              : notification.type === NotificationType.TASK
              ? '#2bbbad'
              : '#9b59b6',
          color: 'white',
        }}
      />
      <Box display="flex" alignItems="center" my={1}>
        <Typography className={classes.header}>
          {notification.type === NotificationType.COMMENT
            ? 'Comment left at '
            : notification.type === NotificationType.ACTIVITY ||
              notification.type === NotificationType.ACTIVITY_WITH_COMMENT
            ? 'Activity at '
            : notification.type === NotificationType.ALERT
            ? 'Alert at '
            : notification.type === NotificationType.TASK
            ? 'New Task at '
            : 'New Info about '}
          {notification.referenceObject ? `${getReferenceLabel(notification.referenceObject)}` : null}
        </Typography>

        <Button className={classes.titleAnchor} onClick={handleClick} color="primary">
          {notification.referenceID}
        </Button>
      </Box>
    </Fragment>
  );
};

export const notificationSeenStatusChange = async (
  notification: Notification | string,
  user: UserRecord,
  isRead?: boolean,
) => {
  const changeNotificationSeenStatus = firebase.functions().httpsCallable('changeNotificationSeenStatus');
  return await changeNotificationSeenStatus({
    notificationId: typeof notification === 'string' ? notification : notification.id,
    userAlphacomId: user.alphacomId,
    userEmail: user.emailAddress,
    isRead: isRead,
  });
};

const deleteNotification = async (notificationId: string | undefined) => {
  if (notificationId)
    return firebase
      .firestore()
      .collection('notifications')
      .doc(notificationId)
      .delete();
};

const NotificationItemView: React.FC<NotificationItemProps> = ({ notification, handleShowDrawer, ...other }) => {
  const classes = useStyles();
  const history = useHistory();
  const userRecord = useUser()[1];
  const [actingAs] = useContext(ActingAs);
  const [anchorEl, setAnchorEl] = React.useState(null);
  const { enqueueSnackbar } = useSnackbar();
  const [, dispatch] = useContext(GlobalContext);

  const handleClickMenu = (event: any) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = useCallback(() => {
    setAnchorEl(null);
  }, []);
  const onReadForAll = useCallback(() => {
    dispatch({ type: 'START_GLOBAL_LOADING' });
    if (!(notification.readId && userRecord)) return;
    firebase
      .firestore()
      .collection('functions-action')
      .doc()
      .set({
        date: new Date(),
        type: FirebaseActionType.MARK_AS_READ_FOR_ALL,
        done: false,
        userEmail: userRecord.emailAddress,
        userAlphacomId: userRecord.alphacomId,
        readId: notification.readId,
      })
      .then(() => handleClose())
      .catch(() => handleClose())
      .finally(() => dispatch({ type: 'STOP_GLOBAL_LOADING' }));
  }, [notification, handleClose]);
  const handleClick = useCallback(() => {
    dispatch({ type: 'START_GLOBAL_LOADING' });
    notificationSeenStatusChange(notification, userRecord, true)
      .then(() => {
        handleShowDrawer();
        if (notification.type === NotificationType.COMMENT) {
          notification.referenceObject &&
            history.push(
              `/${notification.referenceObject === 'quoteGroup' ? 'quotes/groups' : notification.referenceObject}/${
                notification.referenceID
              }?focusComment=${notification.activity?.id}`,
            );
        } else {
          notification.referenceObject &&
            history.push(
              `/${notification.referenceObject === 'quoteGroup' ? 'quotes/groups' : notification.referenceObject}/${
                notification.referenceID
              }`,
            );
        }
      })
      .finally(() => dispatch({ type: 'STOP_GLOBAL_LOADING' }));
  }, [notification, handleShowDrawer, history]);

  const handleCommentClick = () => {
    dispatch({ type: 'START_GLOBAL_LOADING' });
    notificationSeenStatusChange(notification, userRecord, true)
      .then(() => {
        handleShowDrawer();
        notification.referenceObject &&
          history.push(
            `/${notification.referenceObject === 'quoteGroup' ? 'quotes/groups' : notification.referenceObject}/${
              notification.referenceID
            }?focusComment=${notification.activity?.id}`,
          );
      })
      .finally(() => dispatch({ type: 'STOP_GLOBAL_LOADING' }));
  };

  const handleDeleteNotification = () => {
    deleteNotification(notification.id)
      .then(() => {
        enqueueSnackbar(<Typography color="inherit">Successfully deleted</Typography>, {
          variant: 'success',
          autoHideDuration: 1000,
        });
      })
      .catch(error => {
        console.error('failed to update deleted items', error);
        enqueueSnackbar(<Typography color="inherit">Failed to delete notification - {error.message}</Typography>, {
          variant: 'error',
          autoHideDuration: 1000,
        });
      });
  };
  const handleSeenStatusChange = async (notification: Notification) => {
    dispatch({ type: 'START_GLOBAL_LOADING' });
    notificationSeenStatusChange(notification, userRecord, !notification.seen)
      .then(() => console.log('Changed notification status'))
      .catch(error => {
        console.error('Failed to update notification status', error);
        enqueueSnackbar(
          <Typography color="inherit">Failed to update notification status - {error.message}</Typography>,
          {
            variant: 'error',
            autoHideDuration: 1000,
          },
        );
      })
      .finally(() => dispatch({ type: 'STOP_GLOBAL_LOADING' }));
  };

  return (
    <Card className={classes.root} {...other} style={{ backgroundColor: notification.seen ? 'initial' : '#eee' }}>
      <CardHeader
        title={<NotificationTitle notification={notification} handleClick={handleClick} />}
        subheader={<DateFormattedText date={notification.at} />}
        className={classes.header}
        action={
          <Fragment>
            {/*<Button onClick={onReadForAll}>Read for all</Button>*/}

            <IconButton
              aria-label="close-button-notification-center"
              onClick={() => handleSeenStatusChange(notification)}
            >
              {notification.seen ? <RadioButtonUncheckedIcon /> : <RadioButtonCheckedIcon />}
            </IconButton>
            {!actingAs && (
              <IconButton aria-label="close-button-notification-center" onClick={handleClickMenu}>
                <MoreVertIcon />
              </IconButton>
            )}
            {!actingAs && (
              <Menu id="simple-menu" anchorEl={anchorEl} keepMounted open={Boolean(anchorEl)} onClose={handleClose}>
                {notification.readId ? <MenuItem onClick={onReadForAll}>Read for all</MenuItem> : null}
                <MenuItem onClick={handleDeleteNotification} style={{ color: '#ff0000' }}>
                  Delete
                </MenuItem>
              </Menu>
            )}
          </Fragment>
        }
      />
      <CardContent>
        {notification.type === NotificationType.COMMENT && notification.activity ? (
          <Fragment>
            <Comment activity={notification.activity} handleCommentClick={handleCommentClick} />
          </Fragment>
        ) : notification.activity && notification.type === NotificationType.ACTIVITY ? (
          <Activity activity={notification!.activity} />
        ) : notification.type === NotificationType.ALERT &&
          (notification.alertType !== undefined || notification.taskType) ? (
          <Alert alert={notification} />
        ) : notification.type === NotificationType.TASK && notification.createdTaskType ? (
          <TaskNotification task={notification.createdTaskType} />
        ) : notification.type === NotificationType.INFO && notification.infoType ? (
          <InfoNotification infoType={notification.infoType} />
        ) : notification.type === NotificationType.ACTIVITY_WITH_COMMENT && notification.activity ? (
          <ActivityWithComment activity={notification.activity} handleCommentClick={handleCommentClick} />
        ) : null}
      </CardContent>
      <CardActions>
        <Button size="small" style={{ marginLeft: 'auto' }} variant="contained" color="primary" onClick={handleClick}>
          {notification.referenceObject === 'quoteGroup'
            ? 'View Quote Group'
            : notification.referenceObject === 'bookings'
            ? 'View Booking'
            : 'View Quote'}
        </Button>
      </CardActions>
    </Card>
  );
};

export default NotificationItemView;

interface Props {
  notification: Notification;
}

interface NotificationTitleProps extends Props {
  handleClick: () => void;
}

interface NotificationItemProps extends Props {
  handleShowDrawer: () => void;
}

const getReferenceLabel = (referenceObject: string) =>
  referenceObject === 'bookings' ? 'Booking File No.' : 'Quote number';
