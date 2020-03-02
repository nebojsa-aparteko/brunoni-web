import React from 'react';
import BookingsContext from '../contexts/Bookings';
import FirestoreCollectionProvider from './FirestoreCollection';
import useUser from '../hooks/useUser';

interface Props {
  children: React.ReactNode;
  isAdmin?: boolean;
}

const Bookings: React.FC<Props> = ({ children, isAdmin }) => {
  const userRecord = useUser()[1];

  if(isAdmin) {
    return (
      <FirestoreCollectionProvider name="bookings" context={BookingsContext}>
        {children}
      </FirestoreCollectionProvider>
    );
  } else {
    let query = userRecord?.alphacomClientId
      ? (collection: firebase.firestore.CollectionReference) =>
          collection.where('ForwAdrId', '==', userRecord!.alphacomClientId)
      : null;

      return (
        <FirestoreCollectionProvider name="bookings" query={query} context={BookingsContext}>
          {children}
        </FirestoreCollectionProvider>
      );
  }
};

export default Bookings;
