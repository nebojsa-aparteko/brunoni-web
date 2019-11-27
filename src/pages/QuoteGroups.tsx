import React, { Fragment } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import QuoteGroupsView from '../components/QuoteGroups';

const QuoteGroups: React.FC = () => (
  <Fragment>
    <Navbar />
    <QuoteGroupsView />
    <Footer />
  </Fragment>
);

export default QuoteGroups;
