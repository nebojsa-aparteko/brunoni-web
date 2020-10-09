import React from 'react';
import WeeklyPayment from '../../model/WeeklyPayment';
import { TableCell, TableRow, Typography } from '@material-ui/core';

const PaymentOverviewTableRow: React.FC<Props> = ({ paymentData }) => {
  return (
    <TableRow key={paymentData.id}>
      <TableCell align="left">
        <Typography variant="subtitle1">{paymentData.File}</Typography>
      </TableCell>
      <TableCell align="center">
        <Typography variant="subtitle1">{paymentData.BL}</Typography>
      </TableCell>
      <TableCell align="center">{paymentData.Vessel || '-'}</TableCell>
      <TableCell align="center">{paymentData.Currency}</TableCell>
      <TableCell align="center">{paymentData.Amount}</TableCell>
    </TableRow>
  );
};

export default PaymentOverviewTableRow;

interface Props {
  paymentData: WeeklyPayment;
}
