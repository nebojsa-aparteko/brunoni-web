import React from 'react';
import WeeklyPayment from '../../model/WeeklyPayment';
import { Link, TableCell, TableRow, Typography } from '@material-ui/core';

const PaymentOverviewTableRow: React.FC<Props> = ({ paymentData }) => {
  return (
    <TableRow key={paymentData.id}>
      <TableCell align="left">
        <Link target="_blank" href={`/bookings/${paymentData.bookingId}`}>
          {paymentData.bookingId}
        </Link>
      </TableCell>
      <TableCell align="center">
        <Typography variant="subtitle1">{paymentData.blNumber}</Typography>
      </TableCell>
      <TableCell align="center">{paymentData.vessel || '-'}</TableCell>
      <TableCell align="center">{paymentData.currency}</TableCell>
      <TableCell align="center">{paymentData.amount}</TableCell>
    </TableRow>
  );
};

export default PaymentOverviewTableRow;

interface Props {
  paymentData: WeeklyPayment;
}
