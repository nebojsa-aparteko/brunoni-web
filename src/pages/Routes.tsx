import React, { Fragment, useState } from 'react';
import RouteSearch from '../components/RouteSearch';
import Meta from '../components/Meta';
import { RouteSearchResult } from '../model/route-search/RouteSearchResults';
import { useNavigate } from 'react-router-dom';
import queryString from 'query-string';
import { Box } from '@material-ui/core';

const Routes: React.FC = () => {
  const navigate = useNavigate();
  const [isPicker] = useState(
    queryString.parse(window.location.search.replace('?', '')).isPicker === 'true',
  );

  const handleBookNow = (schedule?: RouteSearchResult) => {
    localStorage.setItem('schedule', JSON.stringify(schedule));
    navigate('/online-booking');
  };

  return (
    <Fragment>
      <Meta title="Schedule" />
      <Box
        display={'flex'}
        flexDirection="column"
        flex={1}
        mt={isPicker ? 4 : 0}
        mb={isPicker ? 4 : 0}
      >
        <RouteSearch isPicker={isPicker} handleBookNow={handleBookNow} />
      </Box>
    </Fragment>
  );
};

export default Routes;
