import React, { useEffect, useState, Fragment, useContext } from 'react';
import { Badge, Drawer, IconButtonProps } from '@material-ui/core';
import IconButton from '@material-ui/core/IconButton';
import NotificationsIcon from '@material-ui/icons/Notifications';
import useNotifications from '../../hooks/useNotifications';
import NotificationsContainer from './NotificationsContainer';
import UserRecordContext from '../../contexts/UserRecordContext';

const NotificationsButton: React.FC<IconButtonProps> = props => {
  const [notificationCount, setNotificationCount] = useState(0);
  const [isNotificationDrawerOpen, setIsNotificationDrawerOpen] = useState(false);
  const handleShowNotifications = () => setIsNotificationDrawerOpen(prevState => !prevState);
  const userRecord = useContext(UserRecordContext);
  const notifications = useNotifications(userRecord?.alphacomId || '');

  useEffect(() => {
    setNotificationCount(
      (prevState: number) =>
        notifications?.reduce((accumulator, currentValue) => (!currentValue.seen ? accumulator + 1 : accumulator), 0) ||
        prevState,
    );
  }, [notifications]);

  return (
    <Fragment>
      <IconButton
        aria-label="notification-button-icon"
        onClick={handleShowNotifications}
        style={{ padding: 8 }}
        {...props}
      >
        <Badge badgeContent={notificationCount} color="secondary">
          <NotificationsIcon color="primary" fontSize="small" />
        </Badge>
      </IconButton>
      <Drawer open={isNotificationDrawerOpen} anchor="right" onClose={handleShowNotifications}>
        <NotificationsContainer handleShow={handleShowNotifications} notifications={notifications} />
      </Drawer>
    </Fragment>
  );
};

export default NotificationsButton;
