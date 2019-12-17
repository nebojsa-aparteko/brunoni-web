import React, { useContext, useMemo } from 'react';
import { Card, CardHeader, Divider, CardContent, Theme, Table, TableRow, TableCell } from '@material-ui/core';
import classNames from 'classnames';
import flow from 'lodash/fp/flow';
import get from 'lodash/fp/get';
import values from 'lodash/fp/values';
import map from 'lodash/fp/map';
import flatten from 'lodash/fp/flatten';
import find from 'lodash/fp/find';
import groupBy from 'lodash/fp/groupBy';
import mapValues from 'lodash/fp/mapValues';
import sum from 'lodash/fp/sum';
import slice from 'lodash/fp/slice';
import flatMap from 'lodash/fp/flatMap';
import toPairs from 'lodash/fp/toPairs';
import orderBy from 'lodash/fp/orderBy';
import TableBody from '@material-ui/core/TableBody';
import Grid from '@material-ui/core/Grid';
import makeStyles from '@material-ui/styles/makeStyles';
import Ports from '../../contexts/Ports';
import filter from 'lodash/fp/filter';
import Port from '../../model/Port';
import TextSkeleton from '../TextSkeleton';
import match from 'autosuggest-highlight/match';
import logAs from '../../utilities/logAs';

interface Props {
  clientPerformance: any;
  year: number;
}

const useStyles = makeStyles((theme: Theme) => ({
  tableCellFont: {
    [theme.breakpoints.down('md')]: {
      fontSize: 10,
      padding: '2px',
    },
    [theme.breakpoints.up('md')]: {
      fontSize: 12,
    },
    [theme.breakpoints.up('lg')]: {
      fontSize: 14,
    },
  },
  tableCell: {
    maxWidth: '1em',
  },
}));

interface StringReplacementPair {
  match: string;
  replace: string;
}

const shortenedCountries: StringReplacementPair[] = [
  {
    match: 'UNITED ARAB EMIRATES',
    replace: 'UAE',
  },
  {
    match: 'UNITED KINGDOM',
    replace: 'UK',
  },
];

function replaceAll(str: string, mapObj: StringReplacementPair[]) {
  const re = new RegExp(flatMap((pair: StringReplacementPair) => pair.match)(mapObj).join('|'), 'gi');

  return str.replace(re, (matched: string) => {
    const foundItem = find((pair: StringReplacementPair) => pair.match === matched)(mapObj);
    return foundItem ? foundItem.replace : matched;
  });
}

const extractPortsAggregatedData = (year: number, ports: Port[] | undefined) =>
  flow(
    get('Locations'),
    values,
    map(get(String(year))),
    flatten,
    map(values),
    flatten,
    flatten,
    groupBy('LocationType'),
    mapValues(
      flow(
        groupBy('LocationName'),
        mapValues(flow(map(flow(get('Amount'), Number)), sum)),
        toPairs,
        orderBy(1, 'desc'),
        slice(0, 5),
      ),
    ),
  );

const Top5Ports: React.FC<{ data?: Array<[string | React.ReactNode, string | React.ReactNode]> }> = ({ data }) => {
  const classes = useStyles();

  return (
    <Table size="small" aria-label="a dense table">
      <colgroup>
        <col style={{ width: '10%' }} />
        <col style={{ width: '90%' }} />
      </colgroup>
      <TableBody>
        {data
          ? data.map((item, index) => (
              <TableRow key={index}>
                <TableCell className={classNames(classes.tableCell, classes.tableCellFont)} component="th" scope="row">
                  {index + 1}
                </TableCell>
                <TableCell
                  component="th"
                  scope="row"
                  className={classes.tableCellFont}
                >{`${item[0]} (${item[1]})`}</TableCell>
              </TableRow>
            ))
          : [...Array(5)].map((_, i) => (
              <TableRow key={i}>
                <TableCell>
                  <TextSkeleton width={12} />
                </TableCell>
                <TableCell>
                  <TextSkeleton width={[60, 90]} />
                </TableCell>
              </TableRow>
            ))}
      </TableBody>
    </Table>
  );
};

const Top5PortsPerformance: React.FC<Props> = ({ clientPerformance, year }) => {
  const ports = useContext(Ports);

  const data = useMemo(() => extractPortsAggregatedData(year, ports)(clientPerformance), [
    year,
    clientPerformance,
    ports,
  ]);

  return (
    <Grid container spacing={2}>
      <Grid item md={6} xs={12}>
        <Card>
          <CardHeader title="Top 5 Origins" />
          <Divider />
          <CardContent>
            <Top5Ports data={data['POL']} />
          </CardContent>
        </Card>
      </Grid>
      <Grid item md={6} xs={12}>
        <Card>
          <CardHeader title="Top 5 Destinations" />
          <Divider />
          <CardContent>
            <Top5Ports data={data['POD']} />
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );
};

export default Top5PortsPerformance;
