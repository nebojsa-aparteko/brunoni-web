import React from 'react';
import formatDate from 'date-fns/format';
import { Table, TableCell, TableRow, makeStyles } from '@material-ui/core';
import TableBody from '@material-ui/core/TableBody';
import UserRecord from '../../model/UserRecord';
import { Quote } from '../../providers/QuoteGroups';

interface Props {
  quote: Quote;
  userData: UserRecord;
}

const useStyles = makeStyles(theme => ({
  tableCellLabel: {
    paddingLeft: 0,
    border: 'none',
    fontWeight: 700,
  },
  tableRow: {
    ['@media not print']: {
      [theme.breakpoints.down('sm')]: {
        display: 'block',
        marginTop: theme.spacing(1),
        marginBottom: theme.spacing(1),

        '& td': {
          display: 'block',
          padding: theme.spacing(0),
        },
      },
    },
    ['@media print']: {
      '& td': {
        padding: theme.spacing(0),
      },
    },
  },
  tableCell: {
    border: 'none',
  },
  tableCellQuoteUserData: {
    ['@media not print']: {
      display: 'none',
    },
  },
}));

interface TableRowProps {
  label: string;
  content: string;
  className?: any;
}

const TableRowData: React.FC<TableRowProps> = ({ label, content, className }) => {
  const classes = useStyles();
  return (
    <TableRow className={classes.tableRow}>
      <TableCell className={classes.tableCellLabel}>{label}</TableCell>
      <TableCell className={classes.tableCell}>{content}</TableCell>
    </TableRow>
  );
};

const QuoteItemHeader: React.FC<Props> = ({ quote, userData }) => {
  const classes = useStyles();
  return (
    <Table size="small" aria-label="a dense table">
      <colgroup>
        <col style={{ width: '40%' }} />
        <col style={{ width: '60%' }} />
      </colgroup>
      <TableBody>
        <TableRowData
          label="Quote For"
          content={userData?.company.name.toUpperCase() + ', ' + userData?.company.city.toUpperCase()}
          className={classes.tableCellQuoteUserData}
        />
        <TableRowData label="" content="" />
        <TableRowData label="Quote Number" content={quote.id} />
        <TableRowData label="Quote Date" content={formatDate(quote.dateIssued, 'd. MMMM yyyy')} />
        {/*<TableRowData label="Quote Reference" content={quote.clientId} />*/}

        <TableRowData
          label="Port of Loading"
          content={`${quote.origin?.city || '?'}, ${quote.origin?.country || '?'}`}
        />
        <TableRowData
          label="Port of Discharge"
          content={`${quote.destination?.city || '?'}, ${quote.destination?.country || '?'}`}
        />
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
