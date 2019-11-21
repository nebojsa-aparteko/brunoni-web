import React, { Fragment } from 'react';
import Navbar from '../components/Navbar';
import RouteSearch from '../components/RouteSearch';
import Footer from '../components/Footer';

const Routes: React.FC = () => (
  <Fragment>
    <Navbar />
    <RouteSearch />
    <Footer />
  </Fragment>
);

export default Routes;
