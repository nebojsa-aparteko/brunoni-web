import React, { Fragment, useContext, useEffect, useMemo, useState } from 'react';
import { Badge, Drawer, IconButtonProps } from '@material-ui/core';
import IconButton from '@material-ui/core/IconButton';
import NotificationsIcon from '@material-ui/icons/Notifications';
import useNotifications from '../../hooks/useNotifications';
import UserRecordContext from '../../contexts/UserRecordContext';
import firebase from '../../firebase';
import NotificationsView from './NotificationsView';

const NotificationsButton: React.FC<IconButtonProps> = props => {
  const [isNotificationDrawerOpen, setIsNotificationDrawerOpen] = useState(false);
  const handleShowNotifications = () =>
    setIsNotificationDrawerOpen(prevState => {
      (async () => {
        if (prevState) {
          const batch = firebase.firestore().batch();
          notifications
            ?.filter(notification => !notification.seen)
            .map(notification =>
              batch.update(
                firebase
                  .firestore()
                  .collection('notifications')
                  .doc(notification.id),
                { seen: true },
              ),
            );
          batch.commit().catch(err => console.log(err));
        }
      })();
      return !prevState;
    });
  const userRecord = useContext(UserRecordContext);
  const notifications = useNotifications(userRecord?.alphacomId);
  const notificationCount = useMemo(
    () =>
      notifications?.reduce((accumulator, currentValue) => (!currentValue.seen ? accumulator + 1 : accumulator), 0) ||
      0,
    [notifications],
  );

  // useEffect(() => {
  //   let didCancel = false;
  //   if (!didCancel && notifications && notifications.length > 0 && setNotificationCount) {
  //     setNotificationCount(
  //       notifications?.reduce((accumulator, currentValue) => (!currentValue.seen ? accumulator + 1 : accumulator), 0) ||
  //         0,
  //     );
  //   }
  //   return () => {
  //     didCancel = true;
  //   };
  // }, [notifications, setNotificationCount]);

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
        <NotificationsView handleShow={handleShowNotifications} notifications={notifications} />
      </Drawer>
    </Fragment>
  );
};

export default NotificationsButton;
