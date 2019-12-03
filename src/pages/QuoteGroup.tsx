import React, { Fragment } from 'react';
import { RouteComponentProps } from 'react-router';
import QuoteGroupView from '../components/QuoteGroup';
import Helmet from 'react-helmet';

interface Props extends RouteComponentProps<{ id: string }> {}

const QuoteGroup: React.FC<Props> = ({ match }) => (
  <Fragment>
    <Helmet>
      <title>{`Quotes | ${process.env.REACT_APP_BRAND ? process.env.REACT_APP_BRAND.toUpperCase() : ''}`}</title>
    </Helmet>
    <QuoteGroupView id={match.params.id} />
  </Fragment>
);

export default QuoteGroup;
