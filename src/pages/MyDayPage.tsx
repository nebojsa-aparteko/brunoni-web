import React, { Fragment } from 'react';
import Meta from '../components/Meta';
import MyDayContainer from '../components/myDay/MyDayContainer';
import MyDayFilterProvider from '../providers/MyDayFilterProvider';

const MyDayPage = () => {
  return (
    <Fragment>
      <Meta title="My day" />
      <MyDayFilterProvider>
        <MyDayContainer />
      </MyDayFilterProvider>
    </Fragment>
  );
};

export default MyDayPage;
