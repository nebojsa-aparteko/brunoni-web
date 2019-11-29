import React from 'react';
import { RouteComponentProps } from 'react-router';
import QuoteGroupView from '../components/QuoteGroup';

interface Props extends RouteComponentProps<{ id: string }> {}

const QuoteGroup: React.FC<Props> = ({ match }) => <QuoteGroupView id={match.params.id} />;

export default QuoteGroup;
