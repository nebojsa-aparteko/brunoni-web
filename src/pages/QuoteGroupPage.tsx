import React, { Fragment } from 'react';
import { RouteComponentProps } from 'react-router';
import QuoteGroupView from '../components/QuoteGroup';
import Meta from '../components/Meta';
import QuotesProvider from '../providers/QuotesProvider';
import QuoteGroupsProvider from '../providers/QuoteGroupsProvider';

interface Props extends RouteComponentProps<{ id: string }> {}

const QuoteGroup: React.FC<Props> = ({ match }) => (
  <Fragment>
    <Meta title="Quotes" />
    <QuoteGroupView id={match.params.id} />
  </Fragment>
);

const QuoteGroupPage: React.FC<Props> = ({ match, history, location }) => (
  <QuotesProvider>
    <QuoteGroupsProvider>
      <QuoteGroup history={history} location={location} match={match} />
    </QuoteGroupsProvider>
  </QuotesProvider>
);

export default QuoteGroupPage;
