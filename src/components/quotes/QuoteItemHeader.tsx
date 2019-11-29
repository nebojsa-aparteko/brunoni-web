import React from 'react';
import formatDate from 'date-fns/format';
import { Table, TableCell, TableRow, makeStyles } from '@material-ui/core';
import { Quote } from '../../providers/QuotesEndpoint';
import TableBody from '@material-ui/core/TableBody';

interface Props {
  quote: Quote;
}

const useStyles = makeStyles(theme => ({
  tableCellLabel: {
    paddingLeft: 0,
    border: 'none',
    fontWeight: 700,
  },
  tableCell: {
    border: 'none',
  },
}));

interface TableRowProps {
  label: string;
  content: string;
}

const TableRowData: React.FC<TableRowProps> = ({ label, content }) => {
  const classes = useStyles();
  return (
    <TableRow>
      <TableCell className={classes.tableCellLabel}>{label}</TableCell>
      <TableCell className={classes.tableCell}>{content}</TableCell>
    </TableRow>
  );
};

const QuoteItemHeader: React.FC<Props> = ({ quote }) => {
  return (
    <Table size="small" aria-label="a dense table">
      <colgroup>
        <col style={{ width: '40%' }} />
        <col style={{ width: '60%' }} />
      </colgroup>
      <TableBody>
        <TableRowData label="Quote Date" content={formatDate(quote.dateIssued, 'd. MMMM yyyy')} />
        <TableRowData label="Quote Number" content={quote.id} />
        <TableRowData label="Quote Reference" content={quote.clientId} />

        <TableRowData label="Port of Loading" content={`${quote.origin.city}, ${quote.origin.country}`} />
        <TableRowData label="Port of Discharge" content={`${quote.destination.city}, ${quote.destination.country}`} />
        <TableRowData label="Carrier" content={quote.carrier.name || quote.carrier.id} />

        {quote.terms
          .filter(term => term.TermLabel === 'TERMS & CONDITIONS')
          .map(term => (
            <TableRowData label="Terms & Conditions" content={term.TermValue} />
          ))}

        <TableRowData
          label="Quote Validity"
          content={`${formatDate(quote.validityPeriod.from, 'd. MMMM')} – ${formatDate(
            quote.validityPeriod.to,
            'd. MMMM',
          )}`}
        />
      </TableBody>
    </Table>
  );
};

export default QuoteItemHeader;
