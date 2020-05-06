import React, { Fragment, useEffect } from 'react';
import NotificationsView from './NotificationsView';
import Notification from '../../model/Notification';
import firebase from '../../firebase';

const NotificationsContainer: React.FC<Props> = ({ handleShow, notifications }) => {
  useEffect(() => {
    const batch = firebase.firestore().batch();

    notifications
      .filter(notification => !notification.seen)
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
  }, []);
  return (
    <Fragment>{notifications && <NotificationsView notifications={notifications} handleShow={handleShow} />}</Fragment>
  );
};

export default NotificationsContainer;

interface Props {
  notifications: Notification[];
  handleShow: () => void;
}
