import React from 'react';
import { WeeklyPaymentPlatformStatus, WeeklyPaymentStatus, WeeklyPaymentStatusLabel } from '../../model/WeeklyPayment';
import { Checkbox, Chip, Link, TableCell, TableRow } from '@material-ui/core';
import currencyFormatter from '../../utilities/currencyFormatter';
import theme from '../../theme';
import Payment, { DebitCredit } from '../../model/Payment';

const PaymentOverviewTableRow: React.FC<Props> = ({
  paymentData,
  status,
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
    handleSelect && handleSelect();
  };

  return (
    <TableRow hover onClick={handleRowClick}>
      {selectedPayments && (
        <TableCell align="left">
          <Checkbox
            checked={paymentData.id ? selectedPayments.some(pid => pid === paymentData.id) : false}
            onClick={e => onClick(e)}
            disabled={status !== WeeklyPaymentStatus.IN_PROGRESS}
          />
        </TableCell>
      )}
      <TableCell align="left">
        <Link target="_blank" href={`/bookings/${paymentData.bookingId}`} onClick={handleLinkClick}>
          {paymentData.bookingId}
        </Link>
      </TableCell>
      <TableCell align="center">{paymentData.blNumber}</TableCell>
      <TableCell align="center">{paymentData.vessel || '-'}</TableCell>
      <TableCell align="center">
        {status && (
          <Chip
            size="small"
            label={WeeklyPaymentStatusLabel[status as WeeklyPaymentStatus | WeeklyPaymentPlatformStatus]}
            style={{
              backgroundColor:
                status === WeeklyPaymentStatus.BLOCKED
                  ? theme.palette.primary.main
                  : status === WeeklyPaymentStatus.PAID
                  ? '#10881a'
                  : status === WeeklyPaymentPlatformStatus.CLEARED
                  ? '#b186df'
                  : status === WeeklyPaymentPlatformStatus.ON_HOLD
                  ? '#df6b00'
                  : '#999',
              color: 'white',
            }}
          />
        )}
      </TableCell>
      <TableCell align="center">{paymentData.currency}</TableCell>
      <TableCell align="right">{`${paymentData.debitCredit === DebitCredit.CREDIT ? '-' : ''} ${currencyFormatter(
        paymentData.currency,
      )(paymentData.amount)}`}</TableCell>
    </TableRow>
  );
};

export default PaymentOverviewTableRow;

interface Props {
  paymentData: Payment;
  status: WeeklyPaymentStatus | WeeklyPaymentPlatformStatus;
  selectedPayments: string[] | undefined;
  handleSelect?: () => void;
  handleOpenPreviewDialog: (bookingId: string) => void;
}
