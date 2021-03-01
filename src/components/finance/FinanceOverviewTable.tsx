import React, { Fragment, useMemo } from 'react';
import BookingsEmptyResults from '../bookings/BookingsEmptyResults';
import { Checkbox, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@material-ui/core';
import PaymentOverviewTableRow from './PaymentOverviewTableRow';
import WeeklyPayment, { WeeklyPaymentPlatformStatus, WeeklyPaymentStatus } from '../../model/WeeklyPayment';
import { groupBy } from 'lodash/fp';
import FinanceOverviewTableTotalRow from './FinanceOverviewTableTotalRow';
import Commission from '../../model/Commission';
import { Currency, DebitCredit } from '../../model/Payment';
import CommissionOverviewTableRow from './CommissionOverviewTableRow';

const determinePaymentStatus = (payment: WeeklyPayment) => {
  return payment.platformStatus
    ? payment.platformStatus === WeeklyPaymentPlatformStatus.ON_HOLD
      ? payment.status === WeeklyPaymentStatus.IN_PROGRESS
        ? payment.platformStatus
        : payment.status
      : payment.platformStatus === WeeklyPaymentPlatformStatus.CLEARED
      ? payment.status !== WeeklyPaymentStatus.PAID
        ? payment.platformStatus
        : payment.status
      : payment.platformStatus
    : payment.status;
};

const FinanceOverviewTable: React.FC<Props> = ({
  overviewData,
  selectedPayments,
  handleSelect,
  handleOpenPreviewDialog,
  handleSelectDeselectAll,
  commissionsForWeeklyPayments,
  isWeeklyPaymentOverview,
}) => {
  const total = useMemo(() => {
    return overviewData
      ? Object.entries(groupBy((item: WeeklyPayment) => item.currency)(overviewData)).map(([key, value]) => ({
          currency: key as Currency,
          amount: value.reduce(
            (previousValue, currentValue) =>
              currentValue.debitCredit === DebitCredit.DEBIT
                ? previousValue + currentValue.amount
                : previousValue - currentValue.amount,
            0,
          ),
        }))
      : [];
  }, [overviewData]);

  const totalWithoutCommissions = useMemo(() => {
    return commissionsForWeeklyPayments
      ? Object.entries(groupBy((item: Commission) => item.currency)(commissionsForWeeklyPayments)).map(
          ([key, value]) => ({
            currency: key as Currency,
            amount: value.reduce(
              (previousValue, currentValue) =>
                currentValue.debitCredit === DebitCredit.DEBIT
                  ? previousValue + currentValue.amount
                  : previousValue - currentValue.amount,
              total.find(total => total.currency === (key as Currency))?.amount || 0,
            ),
          }),
        )
      : [];
  }, [commissionsForWeeklyPayments, total]);

  return (
    <Fragment>
      {!overviewData || overviewData.length === 0 ? (
        <BookingsEmptyResults message={'No Payment overview found for your filter criteria. Try changing filters.'} />
      ) : (
        <TableContainer component={Paper}>
          <Table aria-label="simple table">
            <TableHead>
              <TableRow>
                {selectedPayments && handleSelectDeselectAll && (
                  <TableCell align="left">
                    <Checkbox
                      checked={selectedPayments.length === overviewData.length}
                      onClick={handleSelectDeselectAll}
                      onFocus={event => event.stopPropagation()}
                    />
                  </TableCell>
                )}
                <TableCell align="left">File No.</TableCell>
                <TableCell align="center">B/L No.</TableCell>
                <TableCell align="center">Vessel</TableCell>
                <TableCell align="center">Status</TableCell>
                <TableCell align="center">Currency</TableCell>
                <TableCell align="right">Amount</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {isWeeklyPaymentOverview
                ? (overviewData as WeeklyPayment[]).map(payment => (
                    <PaymentOverviewTableRow
                      paymentData={payment}
                      status={determinePaymentStatus(payment)}
                      key={payment.id}
                      selectedPayments={selectedPayments}
                      handleSelect={handleSelect ? () => handleSelect(payment.id) : undefined}
                      handleOpenPreviewDialog={handleOpenPreviewDialog}
                    />
                  ))
                : (overviewData as Commission[]).map(commission => (
                    <CommissionOverviewTableRow
                      commission={commission}
                      status={commission.status}
                      key={commission.id}
                      selectedPayments={selectedPayments}
                      handleSelect={handleSelect ? () => handleSelect(commission.id) : undefined}
                      handleOpenPreviewDialog={handleOpenPreviewDialog}
                    />
                  ))}
              {total.map((value, index) => (
                <FinanceOverviewTableTotalRow
                  total={value}
                  key={index}
                  hasSelection={!!selectedPayments}
                  isTotal1={true}
                />
              ))}
              {totalWithoutCommissions.map((value, index) => (
                <FinanceOverviewTableTotalRow
                  total={value}
                  key={index}
                  hasSelection={!!selectedPayments}
                  isTotal1={false}
                />
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Fragment>
  );
};

export default FinanceOverviewTable;

interface Props {
  overviewData: WeeklyPayment[] | Commission[];
  selectedPayments?: string[];
  handleSelect?: (selectedId: string | undefined) => void;
  handleOpenPreviewDialog: (bookingId: string) => void;
  handleSelectDeselectAll?: () => void;
  commissionsForWeeklyPayments?: Commission[];
  isWeeklyPaymentOverview: boolean;
}
