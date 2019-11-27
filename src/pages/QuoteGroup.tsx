import React, { Fragment } from 'react';
import { RouteComponentProps } from 'react-router';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import QuoteGroupView from '../components/QuoteGroup';

interface Props extends RouteComponentProps<{ id: string }> {}

const QuoteGroup: React.FC<Props> = ({ match }) => (
  <Fragment>
    <Navbar />
    <QuoteGroupView id={match.params.id} />
    <Footer />
  </Fragment>
);

export default QuoteGroup;
