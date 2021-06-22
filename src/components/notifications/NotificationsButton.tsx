import React, { Fragment, useContext, useState } from 'react';
import { Badge, Drawer, IconButtonProps } from '@material-ui/core';
import IconButton from '@material-ui/core/IconButton';
import NotificationsIcon from '@material-ui/icons/Notifications';
import useNotifications from '../../hooks/useNotifications';
import UserRecordContext from '../../contexts/UserRecordContext';
import NotificationsView from './NotificationsView';
import ChartsCircularProgress from '../dashboard/ChartsCircularProgress';

const NotificationsButton: React.FC<IconButtonProps> = props => {
  const [isNotificationDrawerOpen, setIsNotificationDrawerOpen] = useState(false);
  const [numberToLoad, setNumberToLoad] = useState<number>(20);
  const [showOnlyUnread, setShowOnlyUnread] = useState(false);
  const handleShowNotifications = () => {
    if (isNotificationDrawerOpen) {
      setShowOnlyUnread(false);
    }
    setIsNotificationDrawerOpen(prevState => !prevState);
  };
  const userRecord = useContext(UserRecordContext);
  const notifications = useNotifications(userRecord?.alphacomId, showOnlyUnread, numberToLoad);

  const handleShowMore = () => {
    setNumberToLoad(prevState => prevState + 20);
  };

  const handleToggleShowUnread = () => {
    setShowOnlyUnread(prevState => !prevState);
  };

  return (
    <Fragment>
      <IconButton
        aria-label="notification-button-icon"
        onClick={handleShowNotifications}
        style={{ padding: 8 }}
        {...props}
      >
        <Badge badgeContent={userRecord?.unreadNotifications || 0} color="secondary">
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
            onFilterByUnread={handleToggleShowUnread}
            onShowMore={handleShowMore}
            numberToLoad={numberToLoad}
          />
        )}
      </Drawer>
    </Fragment>
  );
};

export default NotificationsButton;
