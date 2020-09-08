import React, { Fragment, useCallback } from 'react';
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
  Typography,
} from '@material-ui/core';
import Comment from '../bookings/checklist/Comment';
import Notification, { NotificationType } from '../../model/Notification';
import firebase from 'firebase';
import { useHistory } from 'react-router';
import Activity from '../bookings/checklist/Activity';
import Alert from './Alert';
import RadioButtonCheckedIcon from '@material-ui/icons/RadioButtonChecked';
import RadioButtonUncheckedIcon from '@material-ui/icons/RadioButtonUnchecked';
import TaskNotification from './TaskNotification';
import DateFormattedText from '../DateFormattedText';
import InfoNotification from './InfoNotification';

const useStyles = makeStyles(theme =>
  createStyles({
    root: {
      margin: theme.spacing(2),
    },
    header: {
      marginRight: theme.spacing(1),
    },
    titleAnchor: {
      color: theme.palette.primary.main,
      cursor: 'pointer',
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
            : notification.type === NotificationType.ACTIVITY
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
              : notification.type === NotificationType.ACTIVITY
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
            : notification.type === NotificationType.ACTIVITY
            ? 'Activity at '
            : notification.type === NotificationType.ALERT
            ? 'Alert at '
            : notification.type === NotificationType.TASK
            ? 'New Task at '
            : 'New Info about '}
          {notification.referenceObject ? `${getReferenceLabel(notification.referenceObject)}` : null}
        </Typography>

        <a className={classes.titleAnchor} onClick={handleClick}>
          {notification.referenceID}
        </a>
      </Box>
    </Fragment>
  );
};

const NotificationItemView: React.FC<NotificationItemProps> = ({ notification, handleShowDrawer, ...other }) => {
  const classes = useStyles();
  const history = useHistory();
  const handleClick = useCallback(() => {
    firebase
      .firestore()
      .collection('notifications')
      .doc(notification.id)
      .set({ seen: true } as Notification, { merge: true })
      .then(() => {
        handleShowDrawer();
        notification.referenceObject &&
          history.push(
            `/${notification.referenceObject === 'quoteGroup' ? 'quotes/groups' : notification.referenceObject}/${
              notification.referenceID
            }`,
          );
      });
  }, [notification, handleShowDrawer]);
  const handleSeenStatusChange = async () => {
    const sentNotifications = (await getEmailNotifications(notification.userAlphacomId)).data() as {
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
    return firebase
      .firestore()
      .collection('notifications')
      .doc(notification.id)
      .set({ ...notification, seen: !notification.seen }, { merge: true })
      .then(_ => console.log('Successfully saved'))
      .catch(err => console.log(err));
  };

  return (
    <Card className={classes.root} {...other} style={{ backgroundColor: notification.seen ? 'initial' : '#eee' }}>
      <CardHeader
        title={<NotificationTitle notification={notification} handleClick={handleClick} />}
        subheader={<DateFormattedText date={notification.at} />}
        className={classes.header}
        action={
          <Fragment>
            {/*<Button>Mark read for all</Button>*/}
            <IconButton aria-label="close-button-notification-center" onClick={handleSeenStatusChange}>
              {notification.seen ? <RadioButtonUncheckedIcon /> : <RadioButtonCheckedIcon />}
            </IconButton>
          </Fragment>
        }
      />
      <CardContent>
        {notification.type === NotificationType.COMMENT && notification.activity ? (
          <Fragment>
            <Comment
              comment={notification.activity}
              handleCommentClick={() => {
                firebase
                  .firestore()
                  .collection('notifications')
                  .doc(notification.id)
                  .set({ seen: true } as Notification, { merge: true })
                  .then(() => {
                    handleShowDrawer();
                    notification.referenceObject &&
                      history.push(
                        `/${
                          notification.referenceObject === 'quoteGroup' ? 'quotes/groups' : notification.referenceObject
                        }/${notification.referenceID}#${notification.activity?.id}`,
                      );
                  });
              }}
            />
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
        ) : null}
      </CardContent>
      <CardActions>
        {/*<IconButton>*/}
        {/*  <HelpIcon />*/}
        {/*</IconButton>*/}
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

const getEmailNotifications = (userId: string) =>
  firebase
    .firestore()
    .collection('email-notifications')
    .doc(userId)
    .get();

const getReferenceLabel = (referenceObject: string) =>
  referenceObject === 'bookings' ? 'Booking File No.' : 'Quote number';
