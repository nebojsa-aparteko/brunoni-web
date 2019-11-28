import React, { useContext, useMemo } from 'react';
import { Card, CardHeader, Divider, CardContent, Theme, Table, TableRow, TableCell } from '@material-ui/core';
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
import orderBy from 'lodash/fp/orderBy';
import TableBody from '@material-ui/core/TableBody';
import Grid from '@material-ui/core/Grid';
import makeStyles from '@material-ui/styles/makeStyles';
import { Skeleton } from '@material-ui/lab';
import Ports from '../../contexts/Ports';
import filter from 'lodash/fp/filter';
import Port from '../../model/Port';
import logAs from '../../utilities/logAs';

interface Props {
  clientPerformance: any;
  year: number;
}

const useStyles = makeStyles((theme: Theme) => ({
  tableCell: {
    maxWidth: '1em',
  },
}));

const extractPortsAggregatedData = (year: number, ports: Port[] | undefined) =>
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
        logAs('ports12'),
        map(([key, value]) => {
          if (ports) {
            const portDetails: Port = filter((element: any) => element.id === key)(ports)[0];
            return [`${portDetails.city}, ${portDetails.country}`, value];
          } else return [key, value];
        }),
      ),
    ),
  );

const Top5PortsPerformance: React.FC<Props> = ({ clientPerformance, year }) => {
  const ports = useContext(Ports);

  const data = useMemo(() => {
    const topPorts = extractPortsAggregatedData(year, ports)(clientPerformance);
    console.log('topPORTS', topPorts);
    return topPorts;
  }, [year, clientPerformance, ports]);

  const classes = useStyles();

  const top5TableRendeder = (data: any) => (
    <Table size="small" aria-label="a dense table">
      <colgroup>
        <col style={{ width: '10%' }} />
        <col style={{ width: '90%' }} />
      </colgroup>
      <TableBody>
        {data
          ? data.map((item: any, index: number) => {
              return (
                <TableRow key={index}>
                  <TableCell className={classes.tableCell} component="th" scope="row">
                    {index + 1}
                  </TableCell>
                  <TableCell component="th" scope="row">{`${item[0]} (${item[1]})`}</TableCell>
                </TableRow>
              );
            })
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
          <CardContent>{top5TableRendeder(data['POL'])}</CardContent>
        </Card>
      </Grid>
      <Grid item xs={6}>
        <Card>
          <CardHeader title="Top 5 Destinations" />
          <Divider />
          <CardContent>{top5TableRendeder(data['POD'])}</CardContent>
        </Card>
      </Grid>
    </Grid>
  );
};

export default Top5PortsPerformance;
