import React, { useMemo, useState, useEffect } from 'react';
import map from 'lodash/fp/map';
import flow from 'lodash/fp/flow';
import update from 'lodash/fp/update';
import Context from '../contexts/Bookings';
import useUser from '../hooks/useUser';
// import useClients from '../hooks/useClients';
import useFirestoreCollection from '../hooks/useFirestoreCollection';
import { Booking } from '../model/Booking';

interface Props {
  children: React.ReactNode;
}

const Bookings: React.FC<Props> = ({ children }) => {
  const userRecord = useUser()[1];
  // const clients = useClients();

  const query = userRecord?.alphacomClientId
      ? (collection: firebase.firestore.CollectionReference) =>
          collection.where('ForwAdrId', '==', userRecord!.alphacomClientId)
      : null;

  const snapshot = useFirestoreCollection('bookings', query);
  const bookingsResult = useMemo(() => snapshot?.docs.map(doc => ({ id: doc.id, ...doc.data() })), [snapshot]);

  const [bookings, setBookings] = useState<Booking[] | undefined>(undefined);

  useEffect(() => {
    if ( !bookingsResult ) return;

    console.log('bookingsResult: ', bookingsResult);

    setBookings(
      map(
        flow(
          update('clientName', () => 'TEST_CLIENT'),
        ),
      )(bookingsResult),
    );

  }, [bookingsResult]);

  return <Context.Provider value={bookings}>{children}</Context.Provider>;
};

export default Bookings;
