import React from 'react';
import { TableCell, TableRow } from '@material-ui/core';
import LoadListContainerModel from '../../../model/LoadListContainerModel';
import { Link } from 'react-router-dom';

const LoadListTableRow = ({ item }: Props) => (
  <TableRow key={'A'}>
    <TableCell component="th" scope="row">
      {item.container}
    </TableCell>
    <TableCell align="right">{item.sealNum || '-'}</TableCell>
    <TableCell align="right">{'-'}</TableCell>
    <TableCell align="right">
      <Link to={`/bookings/${item.bookingId}`}>{item.bookingId}</Link>
    </TableCell>
    <TableCell align="right">{item.status || '-'}</TableCell>
    <TableCell align="right">{item.gateIn || '-'}</TableCell>
    <TableCell align="right">{item.pickUp || '-'}</TableCell>
  </TableRow>
);

export default LoadListTableRow;

interface Props {
  item: LoadListContainerModel;
}
