import React, { Fragment } from 'react';
import { RouteComponentProps } from 'react-router';
import QuoteGroupView from '../components/QuoteGroupView';
import Meta from '../components/Meta';

interface Props extends RouteComponentProps<{ id: string }> {}

const QuoteGroupPage: React.FC<Props> = ({ match }) => (
  <Fragment>
    <Meta title="Quotes" />
    <QuoteGroupView id={match.params.id} />
  </Fragment>
);

export default QuoteGroupPage;
