import { useCallback } from 'react';

import useFirestoreCollection from './useFirestoreCollection';

import Notification from '../model/Notification';
import { invoke, update } from 'lodash/fp';
export default function useNotifications(userEmail: string) {
  const query = useCallback(q => q.where('userEmail', '==', userEmail), []);
  const notificationsCollection = useFirestoreCollection('notifications', query);
  return notificationsCollection?.docs.map(doc => {
    return update('at', invoke('toDate'))(doc.data()) as Notification;
  }) as Notification[];
}
