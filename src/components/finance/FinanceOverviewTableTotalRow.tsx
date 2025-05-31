import React from 'react';
import { TableCell, TableRow } from '@material-ui/core';
import currencyFormatter from '../../utilities/currencyFormatter';
import { Currency } from '../../model/Payment';

const FinanceOverviewTableTotalRow: React.FC<Props> = ({ total, hasSelection, isTotal1 }) => (
  <TableRow style={{ backgroundColor: '#eee' }}>
    {hasSelection && <TableCell align="left" />}
    <TableCell align="center" />
    <TableCell align="center" />
    <TableCell align="center" />
    <TableCell align="center" />
    <TableCell align="center" />
    <TableCell align="center">
      {isTotal1 ? `Total 1 ${total.currency}` : `Total 2 ${total.currency}`}
    </TableCell>
    <TableCell align="right">{currencyFormatter(total.currency)(total.amount)}</TableCell>
  </TableRow>
);

export default FinanceOverviewTableTotalRow;

interface Props {
  total: { currency: Currency; amount: number };
  hasSelection: boolean;
  isTotal1?: boolean;
}
