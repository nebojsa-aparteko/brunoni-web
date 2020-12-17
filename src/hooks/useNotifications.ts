import { useCallback } from 'react';

import useFirestoreCollection from './useFirestoreCollection';

import Notification from '../model/Notification';
import { invoke, update, flow } from 'lodash/fp';
import safeInvoke from '../utilities/safeInvoke';

export default function useNotifications(userId?: string, isFilterByUnread?: boolean, limit?: number) {
  const query = useCallback(
    q => {
      let query = q.where('userAlphacomId', '==', userId);
      if (isFilterByUnread) {
        query = query.where('seen', '==', false);
      } else {
        query = query.limit(limit || 100);
      }
      return query.orderBy('at', 'desc');
    },
    [userId, isFilterByUnread, limit],
  );
  const notificationsCollection = useFirestoreCollection('notifications', userId ? query : null);

  return notificationsCollection?.docs.map(doc => {
    return flow(
      update('at', invoke('toDate')),
      update('activity', update('at', safeInvoke('toDate'))),
    )({ id: doc.id, ...doc.data() }) as Notification;
  }) as Notification[];
}
