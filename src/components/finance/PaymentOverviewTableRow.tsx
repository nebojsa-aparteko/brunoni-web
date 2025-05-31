import React from 'react';
import {
  WeeklyPaymentPlatformStatus,
  WeeklyPaymentStatus,
  WeeklyPaymentStatusLabel,
} from '../../model/WeeklyPayment';
import {
  Box,
  Checkbox,
  Chip,
  Link,
  makeStyles,
  Popover,
  TableCell,
  TableRow,
  Typography,
} from '@material-ui/core';
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
      <TableCell align="center">
        {paymentData.invoiceReferences ? (
          <InvoiceReferencesView invoiceReferences={paymentData.invoiceReferences} />
        ) : (
          '-'
        )}
      </TableCell>
      <TableCell align="center">{paymentData.blNumber}</TableCell>
      <TableCell align="center">{paymentData.vessel || '-'}</TableCell>
      <TableCell align="center">
        {status && (
          <Chip
            size="small"
            label={
              WeeklyPaymentStatusLabel[status as WeeklyPaymentStatus | WeeklyPaymentPlatformStatus]
            }
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
const useStyles = makeStyles(theme => ({
  popover: {
    pointerEvents: 'none',
  },
  paper: {
    padding: theme.spacing(1),
  },
}));
const InvoiceReferencesView = ({ invoiceReferences }: { invoiceReferences: string[] }) => {
  const classes = useStyles();

  const [anchorEl, setAnchorEl] = React.useState<HTMLElement | null>(null);
  const open = Boolean(anchorEl);

  const handlePopoverOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handlePopoverClose = () => {
    setAnchorEl(null);
  };
  return (
    <>
      <Box
        display="flex"
        justifyContent="space-evenly"
        alignItems="center"
        onMouseEnter={handlePopoverOpen}
        onMouseLeave={handlePopoverClose}
      >
        <Typography>{invoiceReferences[0]}</Typography>
        {invoiceReferences.length > 1 && <Chip label={`+${invoiceReferences.length - 1}`} />}{' '}
      </Box>
      <Popover
        id="mouse-over-popover"
        className={classes.popover}
        classes={{
          paper: classes.paper,
        }}
        open={open}
        anchorEl={anchorEl}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'left',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'left',
        }}
        onClose={handlePopoverClose}
        disableRestoreFocus
      >
        {invoiceReferences.map(i => (
          <Typography style={{ padding: 1 }}>{i}</Typography>
        ))}
      </Popover>
    </>
  );
};

interface Props {
  paymentData: Payment;
  status: WeeklyPaymentStatus | WeeklyPaymentPlatformStatus;
  selectedPayments: string[] | undefined;
  handleSelect?: () => void;
  handleOpenPreviewDialog: (bookingId: string) => void;
}
