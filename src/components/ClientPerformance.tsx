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
import useEndpoint from '../hooks/useEndpoint';
import Page from './quotes/Page';
import TEUPerformance from './dashboard/TEUPerformance';
import CarrierPerformance from './dashboard/CarrierPerformance';
import ContainerTypePerformance from './dashboard/ContainerTypePerformance';
import Top5PortsPerformance from './dashboard/Top5PortsPerformance';

const asArray = (item: any) => (item === null ? [] : Array.isArray(item) ? item : [item]);

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

  const clientPerformance = useMemo(() => {
    if (busy) {
      return undefined;
    }

    if (error) {
      return null;
    }

    return flow(
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
    )(result);
  }, [result]);

  return (
    <Page title="Analytics Dashboard">
      <Grid container spacing={2}>
        <Grid item xs={8}>
          <TEUPerformance clientPerformance={clientPerformance} />
        </Grid>
        <Grid item xs={4}>
          <CarrierPerformance clientPerformance={clientPerformance} />
        </Grid>
        <Grid item xs={4}>
          <ContainerTypePerformance clientPerformance={clientPerformance} />
        </Grid>
        <Grid item xs={8}>
          <Top5PortsPerformance clientPerformance={clientPerformance} />
        </Grid>
      </Grid>
    </Page>
  );
};

export default ClientPerformance;
