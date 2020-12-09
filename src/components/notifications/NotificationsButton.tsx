import React, { Fragment, useContext, useMemo, useState } from 'react';
import { Badge, Drawer, IconButtonProps } from '@material-ui/core';
import IconButton from '@material-ui/core/IconButton';
import NotificationsIcon from '@material-ui/icons/Notifications';
import useNotifications from '../../hooks/useNotifications';
import UserRecordContext from '../../contexts/UserRecordContext';
import NotificationsView from './NotificationsView';
import ChartsCircularProgress from '../dashboard/ChartsCircularProgress';

const NotificationsButton: React.FC<IconButtonProps> = props => {
  const [isNotificationDrawerOpen, setIsNotificationDrawerOpen] = useState(false);
  const handleShowNotifications = () => setIsNotificationDrawerOpen(prevState => !prevState);
  const userRecord = useContext(UserRecordContext);
  const [showOnlyUnread, setShowOnlyUnread] = useState(false);
  const notifications = useNotifications(userRecord?.alphacomId, showOnlyUnread);

  const notificationCount = useMemo(
    () =>
      notifications?.reduce((accumulator, currentValue) => (!currentValue.seen ? accumulator + 1 : accumulator), 0) ||
      0,
    [notifications],
  );

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
        {!notifications ? (
          <ChartsCircularProgress />
        ) : (
          <NotificationsView
            handleShow={handleShowNotifications}
            notifications={notifications}
            filterByUnread={showOnlyUnread}
            onFilterByUnread={() => setShowOnlyUnread(prevState => !prevState)}
          />
        )}
      </Drawer>
    </Fragment>
  );
};

export default NotificationsButton;
