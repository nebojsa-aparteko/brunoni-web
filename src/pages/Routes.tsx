import React, { Fragment } from 'react';
import RouteSearch from '../components/RouteSearch';
import Helmet from 'react-helmet';

const Routes: React.FC = () => (
  <Fragment>
    <Helmet>
      <title>{`Schedule | ${process.env.REACT_APP_BRAND ? process.env.REACT_APP_BRAND.toUpperCase() : ''}`}</title>
      {console.log('env', process.env)}
    </Helmet>
    <RouteSearch />
  </Fragment>
);

export default Routes;
