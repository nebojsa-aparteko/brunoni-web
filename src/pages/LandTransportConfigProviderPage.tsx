import React from 'react';
import { Container } from '@material-ui/core';
import ProviderConfigMain from '../components/landTransport/config/ProviderConfigMain';
import useLandTransportProvider from '../hooks/useLandTransportProvider';
import { RouteComponentProps } from 'react-router-dom';

interface Props extends RouteComponentProps<{ providerId: string }> {}
const LandTransportConfigProviderPage: React.FC<Props> = ({ match }) => {
  const provider = useLandTransportProvider(match.params.providerId);
  return (
    <Container>
      <ProviderConfigMain provider={provider} />
    </Container>
  );
};

export default LandTransportConfigProviderPage;
