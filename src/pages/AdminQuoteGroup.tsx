import React, { Fragment } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import QuoteGroupView from '../components/QuoteGroupView';
import Meta from '../components/Meta';

const AdminQuoteGroup: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  if (!id) {
    navigate('/not-found');
    return null;
  }

  return (
    <Fragment>
      <Meta title="Quotes" />
      <QuoteGroupView id={id} showCompanyInfo />
    </Fragment>
  );
};

export default AdminQuoteGroup;
