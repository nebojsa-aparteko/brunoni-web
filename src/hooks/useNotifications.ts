import { useCallback } from 'react';

import useFirestoreCollection from './useFirestoreCollection';

import Notification from '../model/Notification';
import { invoke, update } from 'lodash/fp';
export default function useContainers(userEmail: string) {
  const query = useCallback(q => q.where('userEmail', '==', userEmail), []);
  console.log('notification hook');
  const notificationsCollection = useFirestoreCollection('notifications', query);
  return notificationsCollection?.docs.map(doc => {
    console.log(doc.data(), 'Notification');

    return update('at', invoke('toDate'))(doc.data()) as Notification;
  }) as Notification[];
}
