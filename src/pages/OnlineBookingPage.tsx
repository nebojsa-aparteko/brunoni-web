import React, { Fragment } from 'react';
import Meta from '../components/Meta';
import OnlineBookingContainer from '../components/onlineBooking/OnlineBookingContainer';

const OnlineBookingPage = () => {
  return (
    <Fragment>
      <Meta title="Online Booking" />
      <OnlineBookingContainer />
    </Fragment>
  );
};

export default OnlineBookingPage;
