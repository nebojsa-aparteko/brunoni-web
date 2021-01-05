import React, { Fragment } from 'react';
import Meta from '../components/Meta';
import MyDayContainer from '../components/myDay/MyDayContainer';

const MyDayPage = () => {
  return (
    <Fragment>
      <Meta title="My day" />
      <MyDayContainer />
    </Fragment>
  );
};

export default MyDayPage;
