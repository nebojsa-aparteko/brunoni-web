import React, { useContext, useMemo, Fragment } from 'react';
import classNames from 'classnames';
import flow from 'lodash/fp/flow';
import filter from 'lodash/fp/filter';
import get from 'lodash/fp/get';
import groupBy from 'lodash/fp/groupBy';
import mapValues from 'lodash/fp/mapValues';
import head from 'lodash/fp/head';
import map from 'lodash/fp/map';
import update from 'lodash/fp/update';
import keys from 'lodash/fp/keys';
import flatten from 'lodash/fp/flatten';
import uniq from 'lodash/fp/uniq';
import FiberManualRecordIcon from '@material-ui/icons/FiberManualRecord';
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
  Tooltip,
  CircularProgress,
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

const containerIdsToHide = ['22P1', '22P3', '22P5', '42P1', '42P3', '42P5', '45P3'];

const useStyles = makeStyles((theme: Theme) => ({
  avatar: {
    width: 18,
    height: 18,
  },
  good: {
    color: colors.green[300],
  },
  onRequest: {
    color: colors.yellow[500],
  },
  notAvailable: {
    color: colors.red[600],
  },
  enableHorizontalScroll: {
    overflowX: 'auto',
  },
  narrowCells: {
    paddingLeft: 6,
    paddingRight: 6,
  },
  tableRow: {
    '&:hover': {
      backgroundColor: theme.palette.background.default,
    },
  },
  rowTitle: {
    whiteSpace: 'nowrap',
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
            filter(containerId => containerIdsToHide.indexOf(containerId) < 0),
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

  const bodyTransform = useMemo(() => updateEquipmentSituationBody(carriers, containerTypes), [
    carriers,
    containerTypes,
  ]);

  const { result } = useEndpoint(
    '/equipmentSituation',
    bodyTransform,
    withTestData('equipmentSituation', bodyTransform),
  );

  const data = result as NormalizedData;

  return (
    <Container>
      <Box p={2} mt={5} mb={3}>
        <Typography variant="h3" gutterBottom>
          Equipment Situation
        </Typography>
        <Typography variant="subtitle2">
          Find below the overview of all equipment available in Switzerland for your export bookings
        </Typography>

        <Box display="flex" mt={3}>
          <Box display="flex">
            <FiberManualRecordIcon className={`${classes.avatar} ${classes.good}`} />
            <Box ml={1}>
              <Typography variant="body1">Good</Typography>
            </Box>
          </Box>
          <Box display="flex" ml={3}>
            <FiberManualRecordIcon className={`${classes.avatar} ${classes.onRequest}`} />
            <Box ml={1}>
              <Typography variant="body1">On request</Typography>
            </Box>
          </Box>
          <Box display="flex" ml={3}>
            <FiberManualRecordIcon className={`${classes.avatar} ${classes.notAvailable}`} />
            <Box ml={1}>
              <Typography variant="body1">Not available</Typography>
            </Box>
          </Box>
        </Box>

        <Box mt={3}>
          <Typography variant="body2">Last Update: {data ? 'Today' : <CircularProgress size={13} />}</Typography>
        </Box>
      </Box>
      <Box my={3}>
        {data &&
          data.map(({ carrier, containerTypes, locations }) => (
            <Box key={carrier.id} my={5}>
              <Box p={2}>
                <Typography variant="h4">{carrier.name || carrier.id}</Typography>
              </Box>
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
                      <TableRow key={i} className={classes.tableRow}>
                        <TableCell component="th" scope="row" className={classes.rowTitle}>
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
                              <Tooltip title={status}>
                                <FiberManualRecordIcon className={className} />
                              </Tooltip>
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
