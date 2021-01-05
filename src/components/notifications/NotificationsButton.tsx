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
  const [numberToLoad, setNumberToLoad] = useState<number>(100);
  const [showOnlyUnread, setShowOnlyUnread] = useState(true);
  const handleShowNotifications = () => {
    if (isNotificationDrawerOpen) {
      setNumberToLoad(100);
      setShowOnlyUnread(true);
    } else {
      setNumberToLoad(10);
      setShowOnlyUnread(false);
    }
    setIsNotificationDrawerOpen(prevState => !prevState);
  };
  const userRecord = useContext(UserRecordContext);
  const notifications = useNotifications(userRecord?.alphacomId, showOnlyUnread, numberToLoad);

  const notificationCount = useMemo(
    () =>
      notifications?.reduce((accumulator, currentValue) => (!currentValue.seen ? accumulator + 1 : accumulator), 0) ||
      0,
    [notifications],
  );

  const handleShowMore = () => {
    setNumberToLoad(prevState => prevState + (showOnlyUnread ? 100 : 10));
  };

  const handleToggleShowUnread = () => {
    if (!showOnlyUnread && isNotificationDrawerOpen) {
      setNumberToLoad(100);
    } else {
      setNumberToLoad(10);
    }
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
        <Badge badgeContent={notificationCount >= 100 ? '100+' : notificationCount} color="secondary">
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
