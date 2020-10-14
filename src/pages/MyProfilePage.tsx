import React, { Fragment } from 'react';
import Meta from '../components/Meta';
import MyProfileContainer from '../components/MyPrifileContainer';

const MyProfilePage = () => {
  return (
    <Fragment>
      <Meta title="My Profile" />
      <MyProfileContainer />
    </Fragment>
  );
};

export default MyProfilePage;
