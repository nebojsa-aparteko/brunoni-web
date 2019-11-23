import { QuoteDetailQuoteDetail } from '../../model/quotes/QuotesResult';
import React, { Fragment } from 'react';
import { Grid } from '@material-ui/core';
import Table from '@material-ui/core/Table';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import TableCell from '@material-ui/core/TableCell';
import TableBody from '@material-ui/core/TableBody';

interface Props {
  quoteDetails: QuoteDetailQuoteDetail[];
}
const QuoteItemQuoteDetails: React.FC<Props> = ({ quoteDetails }) => (
  <Fragment>
    <Grid item xs={12}>
      <Table aria-label="simple table">
        <TableHead>
          <TableRow>
            <TableCell>Description</TableCell>
            <TableCell>Currency</TableCell>
            <TableCell>Cost Value</TableCell>
            <TableCell>Cost Unit</TableCell>
            <TableCell>Remark</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {quoteDetails.map((quoteDetail: QuoteDetailQuoteDetail) => (
            <TableRow key={quoteDetail.Pos}>
              <TableCell component="th" scope="row">
                {quoteDetail.Description}
              </TableCell>
              <TableCell>{quoteDetail.Currency}</TableCell>
              <TableCell>{quoteDetail.CostValue}</TableCell>
              <TableCell>{quoteDetail.CostUnit}</TableCell>
              <TableCell>
                {quoteDetail.RemarkRef || ''}
                {quoteDetail.Remark}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Grid>
  </Fragment>
);

export default QuoteItemQuoteDetails;
