import React, { Fragment } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import QuotesView from '../components/Quotes';

interface Props {}

const Quotes: React.FC<Props> = ({}) => (
  <Fragment>
    <Navbar />
    <QuotesView />
    <Footer />
  </Fragment>
);

export default Quotes;
