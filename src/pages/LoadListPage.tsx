import React, { Fragment } from 'react';
import Meta from '../components/Meta';
import LoadListContainer from '../components/bookings/loadlist/LoadListContainer';

const LoadListPage = () => {
  return (
    <Fragment>
      <Meta title="Load list Overview" />
      <LoadListContainer />
    </Fragment>
  );
};

export default LoadListPage;
