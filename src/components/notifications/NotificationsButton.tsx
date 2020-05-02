import React, { useEffect, useState, Fragment } from 'react';
import { Badge, Drawer, IconButtonProps } from '@material-ui/core';
import IconButton from '@material-ui/core/IconButton';
import NotificationsIcon from '@material-ui/icons/Notifications';
import useNotifications from '../../hooks/useNotifications';
import NotificationsContainer from './NotificationsContainer';

const NotificationsButton: React.FC<IconButtonProps> = props => {
  const [notificationCount, setNotificationCount] = useState(0);
  const [isNotificationDrawerOpen, setIsNotificationDrawerOpen] = useState(false);
  const handleShowNotifications = () => setIsNotificationDrawerOpen(prevState => !prevState);
  const notifications = useNotifications('a.zeric@brunoni.ch');

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
