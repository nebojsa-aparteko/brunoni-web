import React, { Fragment } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import QuotesView from '../components/Quotes';

const Quotes: React.FC = () => (
  <Fragment>
    <Navbar />
    <QuotesView />
    <Footer />
  </Fragment>
);

export default Quotes;
