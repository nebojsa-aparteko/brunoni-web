import React from 'react';
import { Box, createStyles, Divider, IconButton, makeStyles, Typography } from '@material-ui/core';
import NotificationItemView from './NotificationItemView';
import Notification from '../../model/Notification';
import CloseIcon from '@material-ui/icons/Close';

const useStyles = makeStyles(theme =>
  createStyles({
    title: {
      margin: theme.spacing(1),
    },
  }),
);

const NotificationsView: React.FC<Props> = ({ notifications, handleShow }) => {
  const classes = useStyles();
  return (
    <Box display="flex" flexDirection="column" justifyContent="center">
      <Box display="flex" justifyContent="space-between">
        <Typography variant="subtitle1" className={classes.title} align="center">
          Notifications
        </Typography>
        <IconButton aria-label="close-button-notification-center" onClick={handleShow}>
          <CloseIcon />
        </IconButton>
      </Box>
      <Divider />
      {notifications.map(notification => (
        <NotificationItemView notification={notification} />
      ))}
    </Box>
  );
};

export default NotificationsView;
interface Props {
  notifications: Notification[];
  handleShow: () => void;
}
