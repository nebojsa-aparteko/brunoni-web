import React, { Fragment } from 'react';
import RouteSearch from '../components/RouteSearch';
import Meta from '../components/Meta';
import { RouteSearchResult } from '../model/route-search/RouteSearchResults';
import { useHistory } from 'react-router';

const Routes: React.FC = () => {
  const history = useHistory();

  const handleBookNow = (schedule?: RouteSearchResult) => {
    localStorage.setItem('schedule', JSON.stringify(schedule));
    history.push('/online-booking');
  };

  return (
    <Fragment>
      <Meta title="Schedule" />
      <RouteSearch handleBookNow={handleBookNow} />
    </Fragment>
  );
};

export default Routes;
