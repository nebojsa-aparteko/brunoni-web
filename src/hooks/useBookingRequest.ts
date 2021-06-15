import useFirestoreDocument from './useFirestoreDocument';
import { BookingRequest } from '../model/BookingRequest';
import { normalizeBookingRequest } from '../providers/BookingRequestsProvider';
import { useMemo } from 'react';

export default (id: string) => {
  const bookingRequestSnapshot = useFirestoreDocument('bookings-requests', id);

  return useMemo(
    () => ({
      br: {
        ...normalizeBookingRequest(bookingRequestSnapshot?.data()),
        id: bookingRequestSnapshot?.id,
      } as BookingRequest,
      exists: bookingRequestSnapshot ? bookingRequestSnapshot.exists : true,
    }),
    [bookingRequestSnapshot],
  );
};
