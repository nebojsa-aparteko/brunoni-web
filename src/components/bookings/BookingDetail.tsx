import React from 'react';
import { RouteComponentProps } from 'react-router';
import BookingView from './Booking';

interface Props extends RouteComponentProps<{ id: string }> {}

const BookingDetail: React.FC<Props> = ({ match }) => <BookingView id={match.params.id} />;

export default BookingDetail;
