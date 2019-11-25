import React, { Fragment } from 'react';
import { RouteComponentProps } from 'react-router';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import QuoteView from '../components/Quote';

interface Props extends RouteComponentProps<{ id: string }> {}

const Quote: React.FC<Props> = ({ match }) => (
  <Fragment>
    <Navbar />
    <QuoteView id={match.params.id} />
    <Footer />
  </Fragment>
);

export default Quote;
