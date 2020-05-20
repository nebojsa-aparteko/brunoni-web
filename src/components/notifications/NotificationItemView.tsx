import React, { Fragment } from 'react';
import { Box, Card, CardContent, CardHeader, Chip, createStyles, makeStyles, Typography } from '@material-ui/core';
import Comment from '../bookings/checklist/Comment';
import Notification, { NotificationType } from '../../model/Notification';
import firebase from 'firebase';
import { useHistory } from 'react-router';
import Activity from '../bookings/checklist/Activity';
import Alert from './Alert';
import { formatDistanceToNowConfigured } from '../../utilities/formattingHelpers';

const useStyles = makeStyles(theme =>
  createStyles({
    root: {
      margin: theme.spacing(2),
    },
    header: {
      marginRight: theme.spacing(1),
    },
  }),
);

const NotificationTitle: React.FC<Props> = ({ notification }) => {
  const history = useHistory();
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
            : 'Alert'
        }`}
        style={{
          backgroundColor:
            notification.type === NotificationType.COMMENT
              ? '#3cb371'
              : notification.type === NotificationType.ACTIVITY
              ? '#00a2f2'
              : '#f4364c',
          color: 'white',
        }}
      />
      <Box display="flex" alignItems="center" my={1}>
        <Typography className={classes.header}>
          {notification.type === NotificationType.COMMENT
            ? 'Comment left at '
            : notification.type === NotificationType.ACTIVITY
            ? 'Activity at '
            : 'Alert at '}
        </Typography>

        <a
          style={{ cursor: 'pointer', textDecoration: 'underline' }}
          onClick={() =>
            notification.referenceObject &&
            history.push(
              `/${notification.referenceObject === 'quoteGroup' ? 'quotes/groups' : notification.referenceObject}/${
                notification.referenceID
              }`,
            )
          }
        >
          {notification.referenceID}
        </a>
      </Box>
    </Fragment>
  );
};

const NotificationItemView: React.FC<Props> = ({ notification, ...other }) => {
  const classes = useStyles();
  const handleSeenStatusChange = () => {
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
        title={<NotificationTitle notification={notification} />}
        subheader={formatDistanceToNowConfigured(notification.at)}
        className={classes.header}
        /*action={
        <IconButton aria-label="close-button-notification-center" onClick={handleSeenStatusChange}>
          {notification.seen ? <RadioButtonUncheckedIcon /> : <RadioButtonCheckedIcon />}
        </IconButton>
        }*/
      />
      <CardContent>
        {notification.type === NotificationType.COMMENT && notification.activity ? (
          <Fragment>
            <Comment comment={notification.activity} />
          </Fragment>
        ) : notification.activity && notification.type === NotificationType.ACTIVITY ? (
          <Activity activity={notification!.activity} />
        ) : notification.type === NotificationType.ALERT && notification.alertType !== undefined ? (
          <Alert alert={notification.alertType} />
        ) : null}
      </CardContent>
    </Card>
  );
};

export default NotificationItemView;

interface Props {
  notification: Notification;
}
