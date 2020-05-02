import React from 'react';
import { Card, CardContent, CardHeader, createStyles, makeStyles, IconButton } from '@material-ui/core';
import Comment from '../bookings/checklist/Comment';
import { ActivityLogItem } from '../bookings/checklist/ActivityModel';
import Notification from '../../model/Notification';
import firebase from 'firebase';

const useStyles = makeStyles(theme =>
  createStyles({
    root: {
      margin: theme.spacing(2),
    },
    header: {},
  }),
);

const NotificationItemView: React.FC<Props> = ({ notification }) => {
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
    <Card className={classes.root}>
      <CardHeader
        title="New mention"
        subheader="In booking: 2223333"
        className={classes.header}
        /*action={
        <IconButton aria-label="close-button-notification-center" onClick={handleSeenStatusChange}>
          {notification.seen ? <RadioButtonUncheckedIcon /> : <RadioButtonCheckedIcon />}
        </IconButton>
        }*/
      />
      <CardContent>
        <Comment
          comment={{ at: notification.at, by: notification.by, comment: notification.comment } as ActivityLogItem}
        />
      </CardContent>
    </Card>
  );
};

export default NotificationItemView;

interface Props {
  notification: Notification;
}
