import { useCallback, useEffect, useState } from 'react';
import firebase from '../firebase';
import useUser from './useUser';
import { TaskStatus } from '../model/Opportunity';

const useOverdueTasksCount = () => {
  const [, userRecord] = useUser();
  const [count, setCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  const fetchOverdueTasksCount = useCallback(async () => {
    if (!userRecord?.id) {
      setCount(0);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    try {
      const today = new Date();
      today.setHours(23, 59, 59, 999); // End of today
      console.debug('userRecord', userRecord);
      const snapshot = await firebase
        .firestore()
        .collection('opportunity-tasks')
        .where('assignedTo', '==', userRecord.id)
        .where('status', '==', TaskStatus.Active)
        .get();

      // Filter client-side for overdue tasks
      const overdueCount = snapshot.docs.filter(doc => {
        const dueDate = doc.data().dueDate?.toDate();
        return dueDate && dueDate <= today;
      }).length;

      setCount(overdueCount);
    } catch (error) {
      console.error('Failed to fetch overdue tasks count:', error);
      setCount(0);
    } finally {
      setIsLoading(false);
    }
  }, [userRecord?.id]);

  useEffect(() => {
    fetchOverdueTasksCount();
  }, [fetchOverdueTasksCount]);

  // Refresh count when called manually
  const refreshCount = useCallback(() => {
    fetchOverdueTasksCount();
  }, [fetchOverdueTasksCount]);
  console.debug('Overdue tasks count:', count);
  return { count, isLoading, refreshCount };
};

export default useOverdueTasksCount;
