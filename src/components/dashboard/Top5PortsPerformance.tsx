import React from 'react';
import { Card, CardHeader, Divider, CardContent, Typography, Chip, Avatar, Box } from '@material-ui/core';
import PerfectScrollbar from 'react-perfect-scrollbar';
import flow from 'lodash/fp/flow';
import get from 'lodash/fp/get';
import values from 'lodash/fp/values';
import map from 'lodash/fp/map';
import flatten from 'lodash/fp/flatten';
import groupBy from 'lodash/fp/groupBy';
import mapValues from 'lodash/fp/mapValues';
import sum from 'lodash/fp/sum';
import sortBy from 'lodash/fp/sortBy';
import slice from 'lodash/fp/slice';
import toPairs from 'lodash/fp/toPairs';
import fromPairs from 'lodash/fp/fromPairs';
import orderBy from 'lodash/fp/orderBy';

interface Props {
  clientPerformance: any;
  year: number;
}

const extractPortsAggregatedData = (year: number) =>
  flow(
    get('Locations'),
    values,
    map(get(String(year))),
    flatten,
    map(get('Details')),
    flatten,
    groupBy('LocationType'),
    mapValues(
      flow(
        groupBy('LocationCode'),
        mapValues(flow(map(flow(get('Amount'), Number)), sum)),
        toPairs,
        orderBy(1, 'desc'),
        slice(0, 5),
        fromPairs,
      ),
    ),
  );

const Top5PortsPerformance: React.FC<Props> = ({ clientPerformance, year }) => {
  const data = extractPortsAggregatedData(year)(clientPerformance);
  return (
    <Card>
      <CardHeader title="Top 5 Ports" />
      <Divider />
      <CardContent>
        <PerfectScrollbar>
          <Box>
            <Typography variant="subtitle2">Top 5 Origins:</Typography>
            {Object.entries(data['POL']).map(([key, value]) => {
              return <Chip key={key} label={`${key} (${value})`} variant="outlined" color="secondary" />;
            })}
          </Box>
          <Box>
            <Typography variant="subtitle2">Top 5 Destinations:</Typography>
            {Object.entries(data['POD']).map(([key, value]) => {
              return <Chip key={key} label={`${key} (${value})`} variant="outlined" color="primary" />;
            })}
          </Box>
        </PerfectScrollbar>
      </CardContent>
    </Card>
  );
};

export default Top5PortsPerformance;
