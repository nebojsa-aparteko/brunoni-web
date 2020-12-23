import React from 'react';
import { Checkbox, Chip, Link, TableCell, TableRow } from '@material-ui/core';
import currencyFormatter from '../../utilities/currencyFormatter';
import theme from '../../theme';
import { DebitCredit } from '../../model/Payment';
import Commission, { CommissionStatus } from '../../model/Commission';

const CommissionOverviewTableRow: React.FC<Props> = ({
  commission,
  status,
  selectedPayments,
  handleSelect,
  handleOpenPreviewDialog,
}) => {
  const handleRowClick = () => {
    handleOpenPreviewDialog(commission.bookingId);
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
            checked={commission.id ? selectedPayments.some(pid => pid === commission.id) : false}
            onClick={e => onClick(e)}
            disabled={status !== CommissionStatus.INVOICED}
          />
        </TableCell>
      )}
      <TableCell align="left">
        <Link target="_blank" href={`/bookings/${commission.bookingId}`} onClick={handleLinkClick}>
          {commission.bookingId}
        </Link>
      </TableCell>
      <TableCell align="center">{commission.blNumber}</TableCell>
      <TableCell align="center">{commission.vessel || '-'}</TableCell>
      <TableCell align="center">
        {status && (
          <Chip
            size="small"
            label={status}
            style={{
              backgroundColor:
                status === CommissionStatus.INVOICED
                  ? theme.palette.primary.main
                  : status === CommissionStatus.PAID
                  ? '#10881a'
                  : '#999',
              color: 'white',
            }}
          />
        )}
      </TableCell>
      <TableCell align="center">{commission.currency}</TableCell>
      <TableCell align="right">{`${commission.debitCredit === DebitCredit.CREDIT ? '-' : ''} ${currencyFormatter(
        commission.currency,
      )(commission.amount)}`}</TableCell>
    </TableRow>
  );
};

export default CommissionOverviewTableRow;

interface Props {
  commission: Commission;
  status: CommissionStatus;
  selectedPayments: string[] | undefined;
  handleSelect?: () => void;
  handleOpenPreviewDialog: (bookingId: string) => void;
}
