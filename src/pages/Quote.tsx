import React from 'react';
import { RouteComponentProps } from 'react-router';
import QuoteView from '../components/Quote';

interface Props extends RouteComponentProps<{ id: string }> {}

const Quote: React.FC<Props> = ({ match }) => <QuoteView id={match.params.id} />;

export default Quote;
