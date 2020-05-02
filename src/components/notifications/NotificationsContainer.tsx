import React, { useContext, Fragment } from 'react';
import { Box, createStyles, Divider, makeStyles, Typography } from '@material-ui/core';
import NotificationsView from './NotificationsView';
import UserRecordContext from '../../contexts/UserRecordContext';
import useNotifications from '../../hooks/useNotifications';
const useStyles = makeStyles(theme =>
  createStyles({
    title: {
      margin: theme.spacing(1),
    },
  }),
);

const NotificationsContainer: React.FC<Props> = ({ handleShow }) => {
  const classes = useStyles();
  //get notifications and pass to view
  const userRecord = useContext(UserRecordContext);
  const notifications = useNotifications('a.zeric@brunoni.ch');

  return (
    <Fragment>{notifications && <NotificationsView notifications={notifications} handleShow={handleShow} />}</Fragment>
  );
};

export default NotificationsContainer;

interface Props {
  handleShow: () => void;
}
