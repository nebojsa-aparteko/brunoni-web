import React, { useMemo, useState } from 'react';
import { Box, FormControl, Grid, IconButton, InputLabel, makeStyles, MenuItem, Theme } from '@material-ui/core';
import get from 'lodash/fp/get';
import update from 'lodash/fp/update';
import omit from 'lodash/fp/omit';
import pick from 'lodash/fp/pick';
import flow from 'lodash/fp/flow';
import groupBy from 'lodash/fp/groupBy';
import map from 'lodash/fp/map';
import mapValues from 'lodash/fp/mapValues';
import head from 'lodash/fp/head';
import flatten from 'lodash/fp/flatten';
import useEndpoint from '../../hooks/useEndpoint';
import Page from '../quotes/Page';
import TEUPerformance from './TEUPerformance';
import CarrierPerformance from './CarrierPerformance';
import ContainerTypePerformance from './ContainerTypePerformance';
import Top5PortsPerformance from './Top5PortsPerformance';
import asArray from '../../utilities/asArray';
import withTestData from '../../utilities/withTestData';
import { Select } from '@material-ui/core';
import TodayIcon from '@material-ui/icons/Today';

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
              asArray,
              groupBy('Year'),
              mapValues(
                flow(
                  map(flow(pick(['Month', 'Details']), update('Month', Number))),
                  groupBy('Month'),
                  mapValues(flow(map(flow(get('Details'), asArray)), flatten)),
                ),
              ),
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

  const [open, setOpen] = React.useState(false);
  const [year, setYear] = useState(currentYear);
  const { busy, error, result } = useEndpoint(
    '/clientPerformance',
    updateClientPerformanceBody,
    withTestData('clientPerformance', updateClientPerformanceBody),
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

  const handleYearChange = (event: React.ChangeEvent<{ value: unknown }>) => {
    setYear(event.target.value as number);
  };

  return (
    <Page title="Analytics Dashboard">
      <Box my={2}>
        <Grid container justify="flex-end">
          <Grid item xs={5} sm={4} md={3} lg={2}>
            <Box display="flex" alignItems="flex-end">
              <Box my={-1}>
                <IconButton color="inherit" component="span" onClick={() => setOpen(true)}>
                  <TodayIcon />
                </IconButton>
              </Box>
              <FormControl fullWidth>
                <Select
                  labelId="year-select-label"
                  id="year-select"
                  open={open}
                  onOpen={() => setOpen(true)}
                  onClose={() => setOpen(false)}
                  value={year}
                  onChange={handleYearChange}
                >
                  <MenuItem value={currentYear} selected>
                    Current Year
                  </MenuItem>
                  <MenuItem value={currentYear - 1}>{currentYear - 1}</MenuItem>
                  <MenuItem value={currentYear - 2}>{currentYear - 2}</MenuItem>
                </Select>
              </FormControl>
            </Box>
          </Grid>
        </Grid>
      </Box>
      <Grid container spacing={2}>
        <Grid item md={8} xs={12}>
          <TEUPerformance clientPerformance={clientPerformance} year={year} />
        </Grid>
        <Grid item md={4} xs={12}>
          <CarrierPerformance clientPerformance={clientPerformance} year={year} />
        </Grid>
        <Grid item md={4} xs={12}>
          <ContainerTypePerformance clientPerformance={clientPerformance} year={year} />
        </Grid>
        <Grid item md={8} xs={12}>
          <Top5PortsPerformance clientPerformance={clientPerformance} year={year} />
        </Grid>
      </Grid>
    </Page>
  );
};

export default DashboardCharts;
