import React, { Fragment } from 'react';
import { createStyles, makeStyles } from '@material-ui/core';
import NotificationsView from './NotificationsView';
import Notification from '../../model/Notification';

const useStyles = makeStyles(theme =>
  createStyles({
    title: {
      margin: theme.spacing(1),
    },
  }),
);

const NotificationsContainer: React.FC<Props> = ({ handleShow, notifications }) => {
  const classes = useStyles();
  //get notifications and pass to view
  // const notifications = useNotifications('a.zeric@brunoni.ch');

  return (
    <Fragment>{notifications && <NotificationsView notifications={notifications} handleShow={handleShow} />}</Fragment>
  );
};

export default NotificationsContainer;

interface Props {
  notifications: Notification[];
  handleShow: () => void;
}
