import React from 'react';
import { TableCell, TableRow } from '@material-ui/core';
import currencyFormatter from '../../utilities/currencyFormatter';
import { Currency } from '../../model/Payment';

const PaymentOverviewTableTotalRow: React.FC<Props> = ({ total, hasSelection }) => (
  <TableRow style={{ backgroundColor: '#eee' }}>
    {hasSelection && <TableCell align="left" />}
    <TableCell align="center" />
    <TableCell align="center" />
    <TableCell align="center" />
    <TableCell align="center" />
    <TableCell align="center">{`Total ${total.currency}`}</TableCell>
    <TableCell align="right">{currencyFormatter(total.currency)(total.amount)}</TableCell>
  </TableRow>
);

export default PaymentOverviewTableTotalRow;

interface Props {
  total: { currency: Currency; amount: number };
  hasSelection: boolean;
}
