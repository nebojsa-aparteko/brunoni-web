import React, { Fragment, useCallback, useContext, useMemo, useState } from 'react';
import { Link } from '../../../components/Link';
import useContainers from '../../../hooks/useContainers';
import map from 'lodash/fp/map';
import invoke from 'lodash/fp/invoke';
import {
  Card,
  CardContent,
  CardHeader,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
  Button,
  Box,
  makeStyles,
  createStyles,
} from '@material-ui/core';
import LoadListUploadDialog from './LoadListUploadDialog';
import ChartsCircularProgress from '../../dashboard/ChartsCircularProgress';
import formatDate from 'date-fns/format';
import { BookingProgressDialog } from '../BookingsTable';
import { Booking } from '../../../model/Booking';
import firebase from '../../../firebase';
import LoadListContainerModel from '../../../model/LoadListContainerModel';
import DirectionsBoatIcon from '@material-ui/icons/DirectionsBoat';
import AddIcon from '@material-ui/icons/Add';
import { useLoadListFilterContext } from '../../../providers/LoadListFilterProvider';
import CarrierInput from '../../inputs/CarrierInput';
import set from 'lodash/fp/set';
import Carriers from '../../../contexts/Carriers';
import theme from '../../../theme';
import Ports from '../../../contexts/Ports';
import PortInput from '../../inputs/PortInput';
import DateRangeInput from '../../inputs/DateRangeInput';
import useUser from '../../../hooks/useUser';

const useStyles = makeStyles(() =>
  createStyles({
    progress: {
      width: '100%',
      backgroundColor: 'white',
      border: '1px solid #ccc',
    },
    progressBar: {
      width: '0%',
      height: '20px',
      backgroundColor: 'green',
    },
    card: {
      margin: '2em',
    },
    carrierTitle: {
      paddingLeft: '1em',
      paddingTop: '1em',
      paddingBottom: '1em',
    },
    vesselWithVoyageTitle: {
      display: 'flex',
      paddingTop: '2em',
      paddingBottom: '1em',
    },
  }),
);

const safeDateFormat = (date: firebase.firestore.Timestamp) =>
  date && formatDate(invoke('toDate')(date), 'dd-MM-yyy');

const normalizeContainerRecord = (item: any) => {
  return {
    id: item.id,
    ...item,
    ets: safeDateFormat(item.ets),
    gateIn: safeDateFormat(item.gateIn),
    pickUp: safeDateFormat(item.pickUp),
    vesselWithVoyage: `${item.vessel} ${item.voyage}`,
  };
};

const groups = ['ets', 'pol', 'vesselWithVoyage', 'carrierId'];

const LoadListContainer = () => {
  let containers = useContainers();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [dialogData, setDialogData] = useState<Booking | undefined>(undefined);
  const [isProgressDialogOpen, setIsProgressDialogOpen] = useState(false);
  const [filters, setFilters] = useLoadListFilterContext();
  const { carrier, origin, dateRange } = filters;
  const classes = useStyles();
  const carriers = useContext(Carriers);
  const ports = useContext(Ports);
  const user = useUser()[1];

  const availableCarriers = useMemo(
    () => carriers?.filter(carrier => user.carriers?.includes(carrier.id)),
    [user.carriers, carriers],
  );

  const handleProgressClick = useCallback(
    async (event: React.MouseEvent<unknown>, bookingId: string) => {
      firebase
        .firestore()
        .collection('bookings')
        .doc(bookingId)
        .get()
        .then(result => {
          setIsProgressDialogOpen(true);
          setDialogData({ id: result.id, ...result.data() } as Booking);
        })
        .catch(error => console.error(`Booking id ${bookingId} does not exist `, error));
    },
    [setIsProgressDialogOpen, setDialogData],
  );

  const handleProgressDialogClose = useCallback(() => {
    setIsProgressDialogOpen(false);
  }, [setIsProgressDialogOpen]);

  const handleDialogClose = useCallback(() => {
    setIsDialogOpen(false);
  }, [setIsDialogOpen]);

  const normalizedContainers = useMemo(
    () =>
      map(normalizeContainerRecord)(containers).reduce((r: any, o: any) => {
        groups
          .reduce(
            (group: any, key: any, i, { length }) =>
              (group[o[key]] = group[o[key]] || (i + 1 === length ? [] : {})),
            r,
          )
          .push(o);
        return r;
      }, {}),
    [containers],
  );

  return (
    <Card>
      <CardHeader
        title={
          <Box display="flex" alignItems="center">
            <Typography variant="h3">Load list</Typography>
            <Box
              display="flex"
              style={{ maxWidth: theme.spacing(35), marginLeft: theme.spacing(3) }}
            >
              <CarrierInput
                label={'Carriers'}
                carriers={availableCarriers}
                onChange={carrier => {
                  if (setFilters) setFilters(set('carrier', carrier)(filters));
                }}
                value={carrier}
              />
            </Box>
            <Box
              display="flex"
              style={{ maxWidth: theme.spacing(35), marginLeft: theme.spacing(3) }}
            >
              <PortInput
                label="Origin"
                ports={ports || []}
                onChange={port => {
                  if (setFilters) setFilters(set('origin', port)(filters));
                }}
                value={origin}
              />
            </Box>
            <Box
              display="flex"
              style={{ maxWidth: theme.spacing(35), marginLeft: theme.spacing(3) }}
            >
              <DateRangeInput
                onChange={dateRange => {
                  if (setFilters) setFilters(set('dateRange', dateRange)(filters));
                }}
                value={dateRange}
                maxDate={new Date()}
              />
            </Box>
          </Box>
        }
        action={
          <Button
            onClick={() => setIsDialogOpen(true)}
            color="primary"
            variant="contained"
            startIcon={<AddIcon />}
          >
            Add load list
          </Button>
        }
      />

      {isDialogOpen && (
        <LoadListUploadDialog
          isOpen={isDialogOpen}
          handleClose={handleDialogClose}
          containers={containers!}
        />
      )}
      <CardContent>
        {!containers && <ChartsCircularProgress />}
        {normalizedContainers &&
          Object.entries(normalizedContainers).map(([date, items]: any, index: number) => (
            <Fragment key={`date-loadList-${date}`}>
              {Object.entries(items).map(([pol, items]: any, index: number) => (
                <Card key={`mapitemid-${index}`} style={{ marginBottom: '2em' }}>
                  <CardHeader title={`${date} ${pol}`} />
                  <Card className={classes.card}>
                    <CardContent>
                      {Object.entries(items).map(
                        ([vesselWithVoyage, items]: any, index: number) => (
                          <Fragment key={`vesselWithVoyageItems-${index}`}>
                            <div className={classes.vesselWithVoyageTitle}>
                              <DirectionsBoatIcon />
                              <Typography style={{ paddingLeft: '1em' }} variant="subtitle1">
                                {vesselWithVoyage}
                              </Typography>
                            </div>
                            {Object.entries(items).map(([carrierId, items]: any, index: number) => (
                              <Card key={`${carrierId}${index}`}>
                                <Fragment key={`carrierIdItems-${index}`}>
                                  <Typography className={classes.carrierTitle} variant="subtitle2">
                                    {carrierId}
                                  </Typography>
                                  <Table size="small">
                                    <TableHead>
                                      <TableRow>
                                        <TableCell align="right">Container</TableCell>
                                        <TableCell align="right">Seal No</TableCell>
                                        <TableCell align="right">Delivery Ref</TableCell>
                                        <TableCell align="right">Booking #</TableCell>
                                        <TableCell align="center">Progress</TableCell>
                                        <TableCell align="right">Status</TableCell>
                                        <TableCell align="right">Pick up Date</TableCell>
                                        <TableCell align="right">Gate in Date</TableCell>
                                      </TableRow>
                                    </TableHead>
                                    <TableBody>
                                      {items.map((item: LoadListContainerModel) => (
                                        <TableRow key={item.container}>
                                          <TableCell component="th" scope="row" align="right">
                                            {item.container}
                                          </TableCell>
                                          <TableCell component="th" scope="row" align="right">
                                            {item.sealNum || ''}
                                          </TableCell>
                                          <TableCell component="th" scope="row" align="right">
                                            {item.deliveryRef || ''}
                                          </TableCell>
                                          <TableCell component="th" scope="row" align="right">
                                            <Link
                                              to={`/bookings/${item.bookingId}`}
                                              target="_blank"
                                              style={{ textDecoration: 'none' }}
                                            >
                                              {item.bookingId || ''}
                                            </Link>
                                          </TableCell>
                                          <TableCell component="th" scope="row" align="right">
                                            {item.checklistCheckedCount !== undefined &&
                                              item.checklistItemCount !== undefined &&
                                              item.checklistCheckedCount >= 0 &&
                                              item.checklistItemCount > 0 && (
                                                <Box
                                                  onClick={(event: React.MouseEvent<unknown>) =>
                                                    handleProgressClick(event, item.bookingId)
                                                  }
                                                  display="flex"
                                                  style={{ cursor: 'pointer', width: 70 }}
                                                >
                                                  <div className={classes.progress}>
                                                    <div
                                                      className={classes.progressBar}
                                                      role="progressbar"
                                                      style={{
                                                        width: `${
                                                          (item.checklistCheckedCount /
                                                            item.checklistItemCount) *
                                                          100
                                                        }%`,
                                                      }}
                                                    />
                                                  </div>

                                                  <Typography
                                                    variant="subtitle2"
                                                    style={{ marginLeft: 4 }}
                                                  >
                                                    {item.checklistCheckedCount}/
                                                    {item.checklistItemCount}
                                                  </Typography>
                                                </Box>
                                              )}
                                          </TableCell>
                                          <TableCell component="th" scope="row" align="right">
                                            {item.status || ''}
                                          </TableCell>
                                          <TableCell component="th" scope="row" align="right">
                                            {item.pickUp || '-'}
                                          </TableCell>
                                          <TableCell component="th" scope="row" align="right">
                                            {item.gateIn || '-'}
                                          </TableCell>
                                        </TableRow>
                                      ))}
                                    </TableBody>
                                  </Table>
                                </Fragment>
                              </Card>
                            ))}
                          </Fragment>
                        ),
                      )}
                    </CardContent>
                  </Card>
                </Card>
              ))}
            </Fragment>
          ))}
      </CardContent>

      {dialogData && (
        <BookingProgressDialog
          isOpen={isProgressDialogOpen}
          handleClose={handleProgressDialogClose}
          booking={dialogData!}
        />
      )}
    </Card>
  );
};

export default LoadListContainer;
