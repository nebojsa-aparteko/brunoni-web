import React, { Fragment, useMemo, useState } from 'react';
import useContainers from '../../../hooks/useContainers';
import map from 'lodash/fp/map';
import invoke from 'lodash/fp/invoke';
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  TextField,
  Typography,
  TableCell,
  TableRow,
  TableHead,
  TableBody,
  Table,
} from '@material-ui/core';
import Papa, { ParseConfig } from 'papaparse';
import firebase from '../../../firebase';
import LoadListContainerModel from '../../../model/LoadListContainerModel';
import formatDate from 'date-fns/format';
import ChartsCircularProgress from '../../dashboard/ChartsCircularProgress';

const saveLoadListChanges = (containerId: string, item: LoadListContainerModel) => {
  if (!containerId) return;
  return firebase
    .firestore()
    .collection('containers')
    .doc(containerId)
    .set(item, { merge: true });
};

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
  const [loadListInput, setLoadListInput] = useState('');

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

  const handleLoadListPaste = (event: React.ChangeEvent<HTMLInputElement>) => {
    setLoadListInput(event.target.value);
    console.log(event.target.value);
  };
  const handleLoadListSave = () => {
    console.log(
      Papa.parse(loadListInput, {
        delimiter: ',',
        header: false,
        columns: ['container', 'sealNum', 'status'],
        skipEmptyLines: true,
      } as ParseConfig),
    );
    Papa.parse(loadListInput, {
      delimiter: ',',
      header: false,
      columns: ['container', 'sealNum', 'status'],
      skipEmptyLines: true,
    } as ParseConfig).data.map(c =>
      saveLoadListChanges(normalizedContainers.find((normCont: any) => normCont.container === c.container)?.id, c),
    );
  };

  return (
    <Fragment>
      <TextField
        id="load-list-text-field"
        label="Add load list input"
        variant="outlined"
        multiline
        rows={10}
        onChange={handleLoadListPaste}
        style={{ width: '100%' }}
      />

      <Button onClick={handleLoadListSave}>Add load list</Button>
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
