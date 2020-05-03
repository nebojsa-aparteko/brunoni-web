import { useCallback } from 'react';

import useFirestoreCollection from './useFirestoreCollection';

import Notification from '../model/Notification';
import { invoke, update } from 'lodash/fp';
export default function useNotifications(userId: string) {
  const query = useCallback(
    q =>
      q
        .where('userAlphacomId', '==', userId)
        .orderBy('at', 'desc')
        .limit(50),
    [],
  );
  const notificationsCollection = useFirestoreCollection('notifications', query);
  return notificationsCollection?.docs.map(doc => {
    return update('at', invoke('toDate'))({ id: doc.id, ...doc.data() }) as Notification;
  }) as Notification[];
}
