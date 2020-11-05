import React from 'react';
import WeeklyPayment, { Status } from '../../model/WeeklyPayment';
import { Checkbox, Chip, Link, TableCell, TableRow } from '@material-ui/core';
import currencyFormatter from '../../utilities/currencyFormatter';
import theme from '../../theme';

const PaymentOverviewTableRow: React.FC<Props> = ({
  paymentData,
  selectedPayments,
  handleSelect,
  handleOpenPreviewDialog,
}) => {
  const handleRowClick = () => {
    handleOpenPreviewDialog(paymentData.bookingId);
  };
  const handleLinkClick = (event: React.MouseEvent<HTMLElement>) => {
    event.stopPropagation();
  };

  const onClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    handleSelect();
  };

  return (
    <TableRow hover onClick={handleRowClick}>
      <TableCell align="left">
        <Checkbox
          checked={paymentData.id ? selectedPayments.some(pid => pid === paymentData.id) : false}
          onClick={e => onClick(e)}
          disabled={paymentData.status !== Status.IN_PROGRESS}
        />
      </TableCell>
      <TableCell align="left">
        <Link target="_blank" href={`/bookings/${paymentData.bookingId}`} onClick={handleLinkClick}>
          {paymentData.bookingId}
        </Link>
      </TableCell>
      <TableCell align="center">{paymentData.blNumber}</TableCell>
      <TableCell align="center">{paymentData.vessel || '-'}</TableCell>
      <TableCell align="center">
        {paymentData.status && (
          <Chip
            size="small"
            label={paymentData.status}
            style={{
              backgroundColor:
                paymentData.status === Status.APPROVED
                  ? theme.palette.primary.main
                  : paymentData.status === Status.PAID
                  ? '#10881a'
                  : '#999',
              color: 'white',
            }}
          />
        )}
      </TableCell>
      <TableCell align="center">{paymentData.currency}</TableCell>
      <TableCell align="right">{currencyFormatter(paymentData.currency)(paymentData.amount)}</TableCell>
    </TableRow>
  );
};

export default PaymentOverviewTableRow;

interface Props {
  paymentData: WeeklyPayment;
  selectedPayments: string[];
  handleSelect: () => void;
  handleOpenPreviewDialog: (bookingId: string) => void;
}
