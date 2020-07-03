import React, { Fragment } from 'react';
import Meta from '../components/Meta';
import MyDayContainer from '../components/myDay/MyDayContainer';
import TaskFilterProvider from '../providers/TaskFilterProvider';

const MyDayPage = () => {
  return (
    <Fragment>
      <Meta title="My day" />
      <TaskFilterProvider>
        <MyDayContainer />
      </TaskFilterProvider>
    </Fragment>
  );
};

export default MyDayPage;
