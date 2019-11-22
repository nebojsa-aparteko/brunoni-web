import React, { Fragment } from 'react';
import Navbar from '../components/Navbar';
import GetQuotesForm from '../components/GetQuotes';
import Footer from '../components/Footer';

const GetQuotes: React.FC = () => (
  <Fragment>
    <Navbar />
    <GetQuotesForm />
    <Footer />
  </Fragment>
);

export default GetQuotes;
