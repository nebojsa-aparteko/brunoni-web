import React from 'react';
import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@material-ui/core';
import LoadListContainerModel from '../../../model/LoadListContainerModel';
import LoadListTableRow from './LoadListTableRow';

const LoadListTable = ({ items }: Props) => {
  return (
    <TableContainer component={Paper}>
      <Table aria-label="simple table">
        <TableHead>
          <TableRow>
            <TableCell>Container</TableCell>
            <TableCell align="right">Seal</TableCell>
            <TableCell align="right">DeliveryRef</TableCell>
            <TableCell align="right">Booking</TableCell>
            <TableCell align="right">Status</TableCell>
            <TableCell align="right">Pick up Date</TableCell>
            <TableCell align="right">Gate In Date</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {items.map(item => (
            <LoadListTableRow item={item} />
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default LoadListTable;

interface Props {
  items: LoadListContainerModel[];
}
