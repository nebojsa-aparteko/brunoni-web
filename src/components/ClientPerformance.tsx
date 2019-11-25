import React from 'react';
import { Grid, Container } from '@material-ui/core';
import get from 'lodash/fp/get';
import useEndpoint from '../hooks/useEndpoint';
import Page from './quotes/Page';
import CustomerPerformance from './dashboard/CustomerPerformance';
import CarrierPerformance from './dashboard/CarrierPerformance';
import ContainerTypePerformance from './dashboard/ContainerTypePerformance';
import Top5PortsPerformance from './dashboard/Top5PortsPerformance';

interface Props {}

const updateClientPerformanceBody = get('idStat_011.Statistics');

const initialResults =
  process.env.NODE_ENV !== 'production'
    ? updateClientPerformanceBody(require('../test/ClientPerformanceDataTest.json'))
    : undefined;

const ClientPerformance: React.FC<Props> = ({}) => {
  const { busy, error, result, refresh } = useEndpoint(
    '/clientPerformance',
    updateClientPerformanceBody,
    initialResults,
  );

  return (
    <Page title="Analytics Dashboard">
      <Container maxWidth={false}>
        <Grid container spacing={3}>
          <Grid item xs={8}>
            <CustomerPerformance dataset={[]} />
          </Grid>
          <Grid item xs={4}>
            <CarrierPerformance dataset={[]} />
          </Grid>
          <Grid item xs={4}>
            <ContainerTypePerformance dataset={[]} />
          </Grid>
          <Grid item xs={8}>
            <Top5PortsPerformance dataset={[]} />
          </Grid>
        </Grid>
      </Container>
    </Page>
  );
  {
    /*
    <Box>
     <Typography variant="h6">busy</Typography>
      <Typography>{JSON.stringify(busy)}</Typography>
      <Typography variant="h6">error</Typography>
      <Typography>{JSON.stringify(error)}</Typography>
      <Typography variant="h6">result</Typography>
      <Typography>{JSON.stringify(result)}</Typography>
      <Typography variant="h6">refresh</Typography>
      <Typography>{JSON.stringify(refresh)}</Typography>
    </Box>
    */
  }
};

export default ClientPerformance;
