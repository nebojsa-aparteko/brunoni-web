import React from 'react';
import BookingsContext from '../contexts/Bookings';
import FirestoreCollectionProvider from './FirestoreCollection';

interface Props {
  children: React.ReactNode;
}

const BookingsAdmin: React.FC<Props> = ({ children }) => {
  return (
    <FirestoreCollectionProvider name="bookings" context={BookingsContext}>
      {children}
    </FirestoreCollectionProvider>
  );
};

export default BookingsAdmin;
