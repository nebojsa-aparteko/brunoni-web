import React, { Fragment, useMemo } from 'react';
import BookingsEmptyResults from '../bookings/BookingsEmptyResults';
import { Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@material-ui/core';
import PaymentOverviewTableRow from './PaymentOverviewTableRow';
import WeeklyPayment, { Currency } from '../../model/WeeklyPayment';
import { groupBy } from 'lodash/fp';
import PaymentOverviewTableTotalRow from './PaymentOverviewTableTotalRow';

const PaymentOverviewTable: React.FC<Props> = ({ overviewData, selectedPayments, handleSelect }) => {
  const total = useMemo(() => {
    return overviewData
      ? Object.entries(groupBy((item: WeeklyPayment) => item.currency)(overviewData)).map(([key, value]) => ({
          currency: key as Currency,
          amount: value.reduce((previousValue, currentValue) => currentValue.amount + previousValue, 0),
        }))
      : [];
  }, [overviewData]);

  return (
    <Fragment>
      {!overviewData || overviewData.length === 0 ? (
        <BookingsEmptyResults message={'No Payment overview found for your filter criteria. Try changing filters.'} />
      ) : (
        <TableContainer component={Paper}>
          <Table aria-label="simple table">
            <TableHead>
              <TableRow>
                <TableCell align="center" />
                <TableCell align="left">File No.</TableCell>
                <TableCell align="center">B/L No.</TableCell>
                <TableCell align="center">Vessel</TableCell>
                <TableCell align="center">Status</TableCell>
                <TableCell align="center">Currency</TableCell>
                <TableCell align="right">Amount</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {overviewData.map(payment => (
                <PaymentOverviewTableRow
                  paymentData={payment}
                  key={payment.id}
                  selectedPayments={selectedPayments}
                  handleSelect={() => handleSelect(payment.id)}
                />
              ))}
              {total.map((value, index) => (
                <PaymentOverviewTableTotalRow total={value} key={index} />
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
  overviewData: WeeklyPayment[];
  selectedPayments: string[];
  handleSelect: (selectedId: string | undefined) => void;
}
