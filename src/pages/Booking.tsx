import React from 'react';
import { RouteComponentProps } from 'react-router';
import BookingView from '../components/bookings/Booking';

interface Props extends RouteComponentProps<{ id: string }> {}

const Booking: React.FC<Props> = ({ match }) => <BookingView id={match.params.id} />;

export default Booking;
