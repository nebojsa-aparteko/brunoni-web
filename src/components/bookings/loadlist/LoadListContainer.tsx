import React, { Fragment, useCallback, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
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
import { BoookingProgressDialog } from '../BookingsTable';
import { Booking } from '../../../model/Booking';
import firebase from '../../../firebase';

const useStyles = makeStyles(() =>
  createStyles({
    progress: {
      width: '100%',
      backgroundColor: 'white',
      border: '1px solid #ccc',
      marginRight: '2px',
    },
    progressBar: {
      width: '0%',
      height: '20px',
      backgroundColor: 'green',
    },
  }),
);

const safeDateFormat = (date: firebase.firestore.Timestamp) => date && formatDate(invoke('toDate')(date), 'dd-MM-yyy');

const normalizeContainerRecord = (item: any) => {
  return {
    id: item.id,
    ets: safeDateFormat(item.ets),
    gateIn: safeDateFormat(item.gateIn),
    pickUp: safeDateFormat(item.pickUp),
    vesselWithVoyage: `${item.vessel} ${item.voyage}`,
    bookingId: item.bookingId,
    container: item.container,
    carrierId: item.carrierId,
    checklistCheckedCount: item.checklistCheckedCount,
    checklistItemCount: item.checklistItemCount,
  };
};

const groups = ['ets', 'vesselWithVoyage', 'carrierId'];

const LoadListContainer = () => {
  const containers = useContainers();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [dialogData, setDialogData] = useState<Booking | undefined>(undefined);
  const [isProgressDialogOpen, setIsProgressDialogOpen] = useState(false);
  const classes = useStyles();

  const handleProgressClick = useCallback(
    async (event: React.MouseEvent<unknown>, bookingId: string) => {
      const bookingRef = await firebase
        .firestore()
        .collection('bookings')
        .doc(bookingId)
        .get();
      const booking: Booking = { id: bookingId, ...(bookingRef.data() as Booking) };
      if (booking.Category === 'Export' || booking.Category === 'Import') {
        setIsProgressDialogOpen(true);
        setDialogData(booking);
      }
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
            (group: any, key: any, i, { length }) => (group[o[key]] = group[o[key]] || (i + 1 === length ? [] : {})),
            r,
          )
          .push(o);
        return r;
      }, {}),
    [containers],
  );

  return (
    <Fragment>
      <Button onClick={() => setIsDialogOpen(true)} color="primary">
        Add load list
      </Button>
      <LoadListUploadDialog isOpen={isDialogOpen} handleClose={handleDialogClose} containers={containers!} />
      {!containers && <ChartsCircularProgress />}
      {normalizedContainers &&
        Object.entries(normalizedContainers).map(([date, items]: any, index: number) => (
          <Card key={`mapitemid-${index}`} style={{ marginBottom: '2em' }}>
            <CardHeader title={date} />
            <CardContent>
              {Object.entries(items).map(([vesselWithVoyage, items]: any, index: number) => (
                <Fragment key={`vesselWithVoyageItems-${index}`}>
                  <Typography>{vesselWithVoyage}</Typography>
                  {Object.entries(items).map(([carrierId, items]: any, index: number) => (
                    <Fragment key={`carrierIdItems-${index}`}>
                      <Typography>{carrierId}</Typography>
                      <Table>
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
                          {items.map((item: any, index: number) => (
                            <TableRow key={`index-${index}`}>
                              <TableCell component="th" scope="row" align="right">
                                {item.container}
                              </TableCell>
                              <TableCell component="th" scope="row" align="right">
                                {item.sealNo || ''}
                              </TableCell>
                              <TableCell component="th" scope="row" align="right">
                                {item.deliveryRef || ''}
                              </TableCell>
                              <TableCell component="th" scope="row" align="right">
                                <Link to={`/bookings/${item.bookingId}`}>{item.bookingId || ''}</Link>
                              </TableCell>
                              <TableCell component="th" scope="row" align="right">
                                <Box
                                  onClick={(event: React.MouseEvent<unknown>) =>
                                    handleProgressClick(event, item.bookingId)
                                  }
                                  style={{ marginTop: '1em', marginLeft: '4em', cursor: 'pointer', width: '64px' }}
                                >
                                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <div className={classes.progress}>
                                      <div
                                        className={classes.progressBar}
                                        role="progressbar"
                                        style={{
                                          width: `${(item.checklistCheckedCount / item.checklistItemCount) * 100}%`,
                                        }}
                                      />
                                    </div>
                                    {item.checklistItemCount && (
                                      <Typography variant="subtitle2">
                                        {item.checklistCheckedCount}/{item.checklistItemCount}
                                      </Typography>
                                    )}
                                  </div>
                                </Box>
                              </TableCell>
                              <TableCell component="th" scope="row" align="right">
                                {item.status || ''}
                              </TableCell>
                              <TableCell component="th" scope="row" align="right">
                                {item.pickUp || ''}
                              </TableCell>
                              <TableCell component="th" scope="row" align="right">
                                {item.gateIn || ''}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </Fragment>
                  ))}
                </Fragment>
              ))}
            </CardContent>
          </Card>
        ))}
      {dialogData && (
        <BoookingProgressDialog
          isOpen={isProgressDialogOpen}
          handleClose={handleProgressDialogClose}
          booking={dialogData!}
        />
      )}
    </Fragment>
  );
};

export default LoadListContainer;
