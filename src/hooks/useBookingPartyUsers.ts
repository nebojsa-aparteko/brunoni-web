import { useContext, useMemo } from 'react';
import UserRecordsContext from '../contexts/UserRecordsContext';
import UserRecord from '../model/UserRecord';

export default function useBookingPartyUsers(bookingPartyId?: string): UserRecord[] {
  const users = useContext(UserRecordsContext);

  return useMemo(() => {
    if (!users || !bookingPartyId) {
      return [];
    }

    return users
      .filter(user => user.company?.id === bookingPartyId)
      .sort((a, b) => (a.firstName! >= b.firstName! ? 1 : -1));
  }, [users, bookingPartyId]);
}
