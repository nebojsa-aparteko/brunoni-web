import React from 'react';
import { RouteComponentProps } from 'react-router';
import QuoteView from '../components/Quote';

interface Props extends RouteComponentProps<{ id: string }> {}

const AdminQuote: React.FC<Props> = ({ match }) => <QuoteView id={match.params.id} showCompanyInfo />;

export default AdminQuote;
