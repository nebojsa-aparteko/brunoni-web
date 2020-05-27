import React, { Fragment } from 'react';
import Meta from '../components/Meta';
import LoadListContainer from '../components/bookings/loadlist/LoadListContainer';
import LoadListFilterProvider from '../providers/LoadListFilterProvider';

const LoadListPage = () => {
  return (
    <Fragment>
      <Meta title="Load list Overview" />
      <LoadListFilterProvider>
        <LoadListContainer />
      </LoadListFilterProvider>
    </Fragment>
  );
};

export default LoadListPage;
