import React, { Fragment } from 'react';
import Meta from '../components/Meta';
import OnlineBookingContainer from '../components/onlineBooking/OnlineBookingContainer';
import ChargeCodes from '../contexts/ChargeCodes';
import FirestoreCollectionProvider from '../providers/FirestoreCollection';

const OnlineBookingPage = () => {
  return (
    <Fragment>
      <Meta title="Online Booking" />
      <FirestoreCollectionProvider name="charge-codes" context={ChargeCodes}>
        <OnlineBookingContainer />
      </FirestoreCollectionProvider>
    </Fragment>
  );
};

export default OnlineBookingPage;
