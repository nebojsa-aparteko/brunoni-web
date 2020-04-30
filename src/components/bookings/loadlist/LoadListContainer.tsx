import React, { Fragment, useMemo, useState } from 'react';
import useContainers from '../../../hooks/useContainers';
import map from 'lodash/fp/map';
import update from 'lodash/fp/update';
import invoke from 'lodash/fp/invoke';
import { flow, groupBy } from 'lodash/fp';
import LoadListItem from './LoadListItem';
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  TextField,
  Typography,
  TableContainer,
  Paper,
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

const saveLoadListChanges = (containerId: string, item: LoadListContainerModel) => {
  if (!containerId) return;
  return firebase
    .firestore()
    .collection('containers')
    .doc(containerId)
    .set(item, { merge: true });
};
const LoadListContainer = () => {
  const containers = useContainers();
  const [loadListInput, setLoadListInput] = useState('');
  const normalizedContainers = useMemo(
    () =>
      flow([
        map(
          flow(update('ets', invoke('toDate')), update('pickUp', invoke('toDate')), update('gateIn', invoke('toDate'))),
        ),
        groupBy('ets'),
      ])(containers),
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
      <Card>
        <CardHeader title={` 20.20.2020 (ETS)`} />
        <CardContent>
          <Typography>CAP SAN AUGUSTIN VOY. 007 S</Typography>
          <Typography>HAMBURG SÜD</Typography>
        </CardContent>
      </Card>
      {Object.values(normalizedContainers).map((c: any) => c.map((b: any) => <LoadListItem item={b} key={b.id} />))}
    </Fragment>
  );
};

export default LoadListContainer;
