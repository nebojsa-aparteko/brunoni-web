import React from 'react';
import BookingsContext from '../contexts/Bookings';
import FirestoreCollectionProvider from './FirestoreCollection';
import useUser from '../hooks/useUser';

interface Props {
  children: React.ReactNode;
}

const Bookings: React.FC<Props> = ({ children }) => {
  const userRecord = useUser()[1];

  const query = userRecord?.alphacomClientId
      ? (collection: firebase.firestore.CollectionReference) =>
          collection.where('ForwAdrId', '==', userRecord!.alphacomClientId)
      : null;

    return (
      <FirestoreCollectionProvider name="bookings" query={query} context={BookingsContext}>
        {children}
      </FirestoreCollectionProvider>
    );
};

export default Bookings;
