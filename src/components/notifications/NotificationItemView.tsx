import React from 'react';
import { Card, CardContent, CardHeader, createStyles, makeStyles, IconButton } from '@material-ui/core';
import Comment from '../bookings/checklist/Comment';
import { ActivityLogItem } from '../bookings/checklist/ActivityModel';
import Notification from '../../model/Notification';
import CloseIcon from '@material-ui/icons/Close';
const useStyles = makeStyles(theme =>
  createStyles({
    root: {
      margin: theme.spacing(2),
    },
    header: {
      backgroundColor: '#ccc',
    },
  }),
);

const NotificationItemView: React.FC<Props> = ({ notification }) => {
  const classes = useStyles();

  return (
    <Card className={classes.root}>
      <CardHeader
        title="New mention"
        subheader="In booking: 2223333"
        action={
          <IconButton aria-label="close-button-notification-center">
            <CloseIcon />
          </IconButton>
        }
        className={classes.header}
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
