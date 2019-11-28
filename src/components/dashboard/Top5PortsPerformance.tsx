import React from 'react';
import { Card, CardHeader, Divider, CardContent, Theme, Table, TableRow, TableCell } from "@material-ui/core";
import flow from 'lodash/fp/flow';
import get from 'lodash/fp/get';
import values from 'lodash/fp/values';
import map from 'lodash/fp/map';
import flatten from 'lodash/fp/flatten';
import groupBy from 'lodash/fp/groupBy';
import mapValues from 'lodash/fp/mapValues';
import sum from 'lodash/fp/sum';
import slice from 'lodash/fp/slice';
import toPairs from 'lodash/fp/toPairs';
import fromPairs from 'lodash/fp/fromPairs';
import orderBy from 'lodash/fp/orderBy';
import TableBody from '@material-ui/core/TableBody';
import Grid from '@material-ui/core/Grid';
import makeStyles from '@material-ui/styles/makeStyles';
import { Skeleton } from '@material-ui/lab';

interface Props {
  clientPerformance: any;
  year: number;
}

const useStyles = makeStyles((theme: Theme) => ({
  tableCell: {
    maxWidth: '1em',
  },
}));

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

  const dataPOL = data['POL'];
  const dataPOD = data['POD'];
  const classes = useStyles();

  const top5TableRendeder = (data: any) => (
    <Table size="small" aria-label="a dense table">
      <colgroup>
        <col style={{ width: '10%' }} />
        <col style={{ width: '90%' }} />
      </colgroup>
      <TableBody>
        {data
          ? Object.entries(data).map(([key, value], index) => (
              <TableRow key={index}>
                <TableCell className={classes.tableCell} component="th" scope="row">
                  {index + 1}
                </TableCell>
                <TableCell component="th" scope="row">{`${key} (${value})`}</TableCell>
              </TableRow>
            ))
          : [...Array(5)].map((_, i) => (
              <TableRow key={i}>
                <TableCell>
                  <Skeleton width={12} height={20} style={{ margin: 0 }} />
                </TableCell>
                <TableCell>
                  <Skeleton width={80} height={20} style={{ margin: 0 }} />
                </TableCell>
              </TableRow>
            ))}
      </TableBody>
    </Table>
  );

  return (
    <Grid container spacing={2}>
      <Grid item xs={6}>
        <Card>
          <CardHeader title="Top 5 Origins" />
          <Divider />
          <CardContent>{top5TableRendeder(dataPOL)}</CardContent>
        </Card>
      </Grid>
      <Grid item xs={6}>
        <Card>
          <CardHeader title="Top 5 Destinations" />
          <Divider />
          <CardContent>{top5TableRendeder(dataPOD)}</CardContent>
        </Card>
      </Grid>
    </Grid>
  );
};

export default Top5PortsPerformance;
