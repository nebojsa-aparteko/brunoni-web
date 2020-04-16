import React, { useMemo } from 'react';
import { RouteComponentProps } from 'react-router';
import BookingView from '../components/bookings/BookingView';
import { normalizeBooking } from '../providers/Bookings';
import useFirestoreDocument from '../hooks/useFirestoreDocument';
import { Booking } from '../model/Booking';

interface Props extends RouteComponentProps<{ id: string }> {}

const BookingContainer: React.FC<Props> = ({ match }) => {
  const bookingId = match.params.id;
  const bookingSnapshot = useFirestoreDocument('bookings', bookingId);

  const bookingDoc = bookingSnapshot ? ({ id: bookingSnapshot.id, ...bookingSnapshot.data() } as Booking) : undefined;

  const booking = useMemo(() => (bookingDoc ? normalizeBooking(bookingDoc) : undefined), [bookingDoc]);

  return <BookingView booking={booking} />;
};

export default BookingContainer;
