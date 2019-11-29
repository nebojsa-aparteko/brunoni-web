import React, { useContext, useMemo } from 'react';
import classNames from 'classnames';
import flow from 'lodash/fp/flow';
import get from 'lodash/fp/get';
import groupBy from 'lodash/fp/groupBy';
import mapValues from 'lodash/fp/mapValues';
import head from 'lodash/fp/head';
import map from 'lodash/fp/map';
import update from 'lodash/fp/update';
import keys from 'lodash/fp/keys';
import flatten from 'lodash/fp/flatten';
import uniq from 'lodash/fp/uniq';
import {
  Theme,
  makeStyles,
  Box,
  Typography,
  Paper,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Avatar,
  colors,
} from '@material-ui/core';
import useEndpoint from '../hooks/useEndpoint';
import withTestData from '../utilities/withTestData';
import asArray from '../utilities/asArray';
import ContainerTypes from '../contexts/ContainerTypes';
import ContainerType from '../model/ContainerType';
import Carriers from '../contexts/Carriers';
import Carrier from '../model/Carrier';
import Container from './Container';
import pickAndRename from '../utilities/pickAndRename';

const useStyles = makeStyles((theme: Theme) => ({
  avatar: {
    width: 18,
    height: 18,
  },
  good: {
    backgroundColor: colors.green[300],
  },
  onRequest: {
    backgroundColor: colors.yellow[500],
  },
  notAvailable: {
    backgroundColor: colors.red[600],
  },
  enableHorizontalScroll: {
    overflowX: 'auto',
  },
  narrowCells: {
    paddingLeft: 6,
    paddingRight: 6,
  },
}));

const updateEquipmentSituationBody = (carriers?: Carrier[] | null, containerTypes?: ContainerType[] | null) =>
  flow(
    get('idStat_012.Statistics.Carrier'),
    asArray,
    map(
      flow(
        pickAndRename({
          CarrierID: 'carrier',
          Location: 'locations',
        }),
        update(
          'locations',
          flow(
            asArray,
            map(
              flow(
                pickAndRename({
                  AdrID: 'name',
                  Detail: 'containers',
                }),
                update('containers', flow(asArray, groupBy('CtypID'), mapValues(flow(head, get('Status'))))),
              ),
            ),
          ),
        ),
        ({ carrier, locations }) => {
          const cts = flow(
            map(flow(get('containers'), keys)),
            flatten,
            uniq,
            map(ct => containerTypes?.find(_ => _.id === ct) || { id: ct }),
          )(locations);

          return {
            carrier: carriers?.find(c => c.id === carrier) || { id: carrier },
            containerTypes: cts,
            locations,
          };
        },
      ),
    ),
  );

type NormalizedData = Array<{
  carrier: { id: string; name?: string; color?: string };
  containerTypes: Array<{ id: string; name?: string; description?: string }>;
  locations: Array<{
    name: string;
    containers: {
      [key: string]: string;
    };
  }>;
}>;

const EquipmentSituation: React.FC = () => {
  const classes = useStyles();
  const carriers = useContext(Carriers);
  const containerTypes = useContext(ContainerTypes);

  const bodyTransform = useMemo(() => {
    return updateEquipmentSituationBody(carriers, containerTypes);
  }, [carriers, containerTypes]);

  const { result } = useEndpoint(
    '/equipmentSituation',
    bodyTransform,
    withTestData('equipmentSituation', bodyTransform),
  );

  const data = result as NormalizedData;

  return (
    <Container>
      <Box py={3}>
        {data &&
          data.map(({ carrier, containerTypes, locations }) => (
            <Box key={carrier.id} my={1}>
              <Typography variant="h4" gutterBottom>
                {carrier.name || carrier.id}
              </Typography>
              <Paper className={classes.enableHorizontalScroll}>
                <Table size="small" aria-label="a dense table">
                  <TableHead>
                    <TableRow>
                      <TableCell>Equipment</TableCell>
                      {containerTypes.map(containerType => (
                        <TableCell key={containerType.id} className={classes.narrowCells}>
                          {containerType.name || containerType.id}
                        </TableCell>
                      ))}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {locations.map((location, i) => (
                      <TableRow key={i}>
                        <TableCell component="th" scope="row">
                          {location.name}
                        </TableCell>
                        {containerTypes.map(containerType => {
                          const status = (location.containers[containerType.id] || '').toLowerCase();

                          const className = classNames({
                            [classes.avatar]: true,
                            [classes.good]: status === 'good',
                            [classes.onRequest]: status === 'on request',
                            [classes.notAvailable]: status === 'not available',
                          });

                          return (
                            <TableCell key={containerType.id}>
                              <Avatar className={className} />
                            </TableCell>
                          );
                        })}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </Paper>
            </Box>
          ))}
      </Box>
    </Container>
  );
};

export default EquipmentSituation;
