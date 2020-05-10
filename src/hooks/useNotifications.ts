import { useCallback } from 'react';

import useFirestoreCollection from './useFirestoreCollection';

import Notification from '../model/Notification';
import { invoke, update, flow } from 'lodash/fp';
import safeInvoke from '../utilities/safeInvoke';
export default function useNotifications(userId?: string) {
  const query = useCallback(
    q =>
      q
        .where('userAlphacomId', '==', userId)
        .orderBy('at', 'desc')
        .limit(50),
    [userId],
  );
  const notificationsCollection = useFirestoreCollection('notifications', query);

  return notificationsCollection?.docs.map(doc => {
    return flow(
      update('at', invoke('toDate')),
      update('activity', update('at', safeInvoke('toDate'))),
    )({ id: doc.id, ...doc.data() }) as Notification;
  }) as Notification[];
}
