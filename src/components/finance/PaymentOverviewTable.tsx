import React, { Fragment, useMemo } from 'react';
import BookingsEmptyResults from '../bookings/BookingsEmptyResults';
import { Checkbox, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@material-ui/core';
import PaymentOverviewTableRow from './PaymentOverviewTableRow';
import WeeklyPayment from '../../model/WeeklyPayment';
import { groupBy } from 'lodash/fp';
import PaymentOverviewTableTotalRow from './PaymentOverviewTableTotalRow';
import Commission from '../../model/Commission';
import Payment, { Currency } from '../../model/Payment';

const PaymentOverviewTable: React.FC<Props> = ({
  overviewData,
  selectedPayments,
  handleSelect,
  handleOpenPreviewDialog,
  handleSelectDeselectAll,
  relevantCommissions,
}) => {
  const total = useMemo(() => {
    return overviewData
      ? Object.entries(groupBy((item: WeeklyPayment) => item.currency)(overviewData)).map(([key, value]) => ({
          currency: key as Currency,
          amount: value.reduce((previousValue, currentValue) => currentValue.amount + previousValue, 0),
        }))
      : [];
  }, [overviewData]);

  const totalWithoutCommissions = useMemo(() => {
    return relevantCommissions
      ? Object.entries(groupBy((item: Commission) => item.currency)(relevantCommissions)).map(([key, value]) => ({
          currency: key as Currency,
          amount: value.reduce(
            (previousValue, currentValue) => previousValue - currentValue.amount,
            total.find(total => total.currency === (key as Currency))?.amount || 0,
          ),
        }))
      : [];
  }, [relevantCommissions, total]);

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
              {(overviewData as Payment[]).map((payment, index) => (
                <PaymentOverviewTableRow
                  paymentData={payment}
                  status={overviewData[index].status}
                  key={payment.id}
                  selectedPayments={selectedPayments}
                  handleSelect={handleSelect ? () => handleSelect(payment.id) : undefined}
                  handleOpenPreviewDialog={handleOpenPreviewDialog}
                />
              ))}
              {total.map((value, index) => (
                <PaymentOverviewTableTotalRow
                  total={value}
                  key={index}
                  hasSelection={!!selectedPayments}
                  isTotal1={true}
                />
              ))}
              {totalWithoutCommissions.map((value, index) => (
                <PaymentOverviewTableTotalRow
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

export default PaymentOverviewTable;

interface Props {
  overviewData: WeeklyPayment[] | Commission[];
  selectedPayments?: string[];
  handleSelect?: (selectedId: string | undefined) => void;
  handleOpenPreviewDialog: (bookingId: string) => void;
  handleSelectDeselectAll?: () => void;
  relevantCommissions?: Commission[];
}
