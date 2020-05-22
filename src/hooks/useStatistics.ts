import UserRecord from '../model/UserRecord';
import useFirestoreDocument from './useFirestoreDocument';

export default function useStatistics(userId: string | undefined = undefined) {
  const statisticForUser = useFirestoreDocument('statistics', userId);

  return statisticForUser?.data() as any;
}
