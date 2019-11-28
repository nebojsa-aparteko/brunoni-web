import React, { useMemo } from 'react';
import { Grid } from '@material-ui/core';
import get from 'lodash/fp/get';
import update from 'lodash/fp/update';
import omit from 'lodash/fp/omit';
import pick from 'lodash/fp/pick';
import flow from 'lodash/fp/flow';
import groupBy from 'lodash/fp/groupBy';
import map from 'lodash/fp/map';
import mapValues from 'lodash/fp/mapValues';
import head from 'lodash/fp/head';
import useEndpoint from '../../hooks/useEndpoint';
import Page from '../quotes/Page';
import TEUPerformance from './TEUPerformance';
import CarrierPerformance from './CarrierPerformance';
import ContainerTypePerformance from './ContainerTypePerformance';
import Top5PortsPerformance from './Top5PortsPerformance';
import asArray from '../../utilities/asArray';
import useTestData from '../../utilities/useTestData';

const updateClientPerformanceBody = get('idStat_011.Statistics');

const normalizeClientPerformance = flow(
  groupBy('StatisticType'),
  mapValues(
    flow(
      head,
      omit('StatisticType'),
      update(
        'Carriers',
        flow(
          asArray,
          groupBy('Carrier'),
          mapValues(
            flow(
              head,
              get('Data'),
              groupBy('Year'),
              mapValues(map(flow(pick(['Month', 'Details']), update('Month', Number)))),
            ),
          ),
        ),
      ),
      get('Carriers'),
    ),
  ),
);

const DashboardCharts: React.FC = () => {
  const currentYear = new Date().getFullYear();

  const { busy, error, result } = useEndpoint(
    '/clientPerformance',
    updateClientPerformanceBody,
    useTestData('clientPerformance', updateClientPerformanceBody),
  );

  const clientPerformance = useMemo(() => {
    if (busy) {
      return undefined;
    }

    if (error) {
      return null;
    }

    return normalizeClientPerformance(result);
  }, [result, busy, error]);

  return (
    <Page title="Analytics Dashboard">
      <Grid container spacing={2}>
        <Grid item md={8} xs={12}>
          <TEUPerformance clientPerformance={clientPerformance} year={currentYear} />
        </Grid>
        <Grid item md={4} xs={6}>
          <CarrierPerformance clientPerformance={clientPerformance} year={currentYear} />
        </Grid>
        <Grid item md={4} xs={6}>
          <ContainerTypePerformance clientPerformance={clientPerformance} year={currentYear} />
        </Grid>
        <Grid item md={8} xs={12}>
          <Top5PortsPerformance clientPerformance={clientPerformance} year={currentYear} />
        </Grid>
      </Grid>
    </Page>
  );
};

export default DashboardCharts;
