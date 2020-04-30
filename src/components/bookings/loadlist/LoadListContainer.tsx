import React, { Fragment, useCallback, useMemo, useState } from 'react';
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
} from '@material-ui/core';
import LoadListUploadDialog from './LoadListUploadDialog';
import ChartsCircularProgress from '../../dashboard/ChartsCircularProgress';
import formatDate from 'date-fns/format';

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
  };
};

const groups = ['ets', 'vesselWithVoyage', 'carrierId'];

const LoadListContainer = () => {
  const containers = useContainers();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
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
          <Card key={`mapitemid-${index}`}>
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
                                {item.bookingId || ''}
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
    </Fragment>
  );
};

export default LoadListContainer;
