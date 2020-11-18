import React from 'react';
import { Grid } from '@material-ui/core';
import Page from '../quotes/Page';
import TEUPerformance from './TEUPerformance';
import CarrierPerformance from './CarrierPerformance';
import ContainerTypePerformance from './ContainerTypePerformance';
import Top5PortsPerformance from './Top5PortsPerformance';
import useStatistics from '../../hooks/useStatistics';
import BookingsEmptyResults from '../bookings/BookingsEmptyResults';

const DashboardCharts: React.FC<Props> = ({ client, year }) => {
  const clientPerformance = useStatistics(client);

  return clientPerformance ? (
    <Page title="Analytics Dashboard">
      <Grid container spacing={2}>
        <Grid id="TEUPerformanceDash" item md={8} xs={12}>
          <TEUPerformance clientPerformance={clientPerformance} year={year} />
        </Grid>
        <Grid id="sharePerCarrierDash" item md={4} xs={12}>
          <CarrierPerformance clientPerformance={clientPerformance} year={year} />
        </Grid>
        <Grid id="containerTypePerformanceDash" item md={4} xs={12}>
          <ContainerTypePerformance clientPerformance={clientPerformance} year={year} />
        </Grid>
        <Grid item md={8} xs={12}>
          <Top5PortsPerformance clientPerformance={clientPerformance} year={year} />
        </Grid>
      </Grid>
    </Page>
  ) : (
    <BookingsEmptyResults message="There is no statistics for this client" />
  );
};

export default DashboardCharts;

interface Props {
  client: string;
  year: number;
}
