import React from 'react';
import { Container } from '@material-ui/core';
import ProviderConfigMain from '../components/landTransport/config/ProviderConfigMain';
import useLandTransportProvider from '../hooks/useLandTransportProvider';
import { useParams, useNavigate } from 'react-router-dom';

const LandTransportConfigProviderPage: React.FC = () => {
  const { providerId } = useParams<{ providerId: string }>();
  const navigate = useNavigate();

  if (!providerId) {
    navigate('/not-found');
    return null;
  }

  const provider = useLandTransportProvider(providerId);

  return (
    <Container>
      <ProviderConfigMain provider={provider} />
    </Container>
  );
};

export default LandTransportConfigProviderPage;
