import React, { Fragment } from 'react';
import BookingsEmptyResults from '../bookings/BookingsEmptyResults';
import { Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@material-ui/core';
import PaymentOverviewTableRow from './PaymentOverviewTableRow';

const PaymentOverviewTable = () => {
  const overviewData = [] as string[];
  return (
    <Fragment>
      {overviewData.length === 0 ? (
        <BookingsEmptyResults message={'No Payment overview found for your filter criteria. Try changing filters.'} />
      ) : (
        <TableContainer component={Paper}>
          <Table aria-label="simple table">
            <TableHead>
              <TableRow>
                <TableCell align="center">File No.</TableCell>
                <TableCell align="center">B/L No.</TableCell>
                <TableCell align="center">Vessel</TableCell>
                <TableCell align="center">Currency</TableCell>
                <TableCell align="center">Amount</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {overviewData.map(() => (
                <PaymentOverviewTableRow />
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Fragment>
  );
};

export default PaymentOverviewTable;
