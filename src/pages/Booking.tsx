import React, { useContext, useMemo } from 'react';
import { RouteComponentProps } from 'react-router';
import BookingView from '../components/bookings/BookingView';
import Bookings from '../contexts/Bookings';
import { normalizeBookings } from '../providers/Bookings';

interface Props extends RouteComponentProps<{ id: string }> {}

const Booking: React.FC<Props> = ({ match }) => {
  const bookings = useContext(Bookings);

  const bookingId = match.params.id;
  // FIXME change this to firebase.get() specific booking instance

  const booking = useMemo(() => bookings?.find(booking => booking.id === bookingId), [bookingId]);

  return <BookingView booking={booking} />;
};

export default Booking;
