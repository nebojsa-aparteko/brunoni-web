import React, { useMemo, Fragment } from 'react';
import formatDate from 'date-fns/format';
import identity from 'lodash/fp/identity';
import invoke from 'lodash/fp/invoke';
import { Table, TableCell, TableRow, makeStyles } from '@material-ui/core';
import TableBody from '@material-ui/core/TableBody';
import UserRecord from '../../model/UserRecord';
import { Quote } from '../../providers/QuoteGroupsProvider';
import { portLongFormatLabel } from '../../utilities/formattedPortDisplay';
//import UserRecords from '../../contexts/UserRecordsContext';
import useUserByAlphacomId from '../../hooks/useUserByAlphacomId';
import { useClientById } from '../../hooks/useClient';

interface Props {
  quote: Quote;
  userData: UserRecord;
  showCompanyInfo?: boolean;
}

const mediaNotPrint = '@media not print';
const mediaPrint = '@media print';
const useStyles = makeStyles(theme => ({
  tableCellLabel: {
    paddingLeft: 0,
    border: 'none',
    fontWeight: 700,
  },
  tableRow: {
    [mediaNotPrint]: {
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
    [mediaPrint]: {
      '& td': {
        padding: theme.spacing(0),
      },
    },
  },
  tableCell: {
    border: 'none',
  },
  tableCellQuoteUserData: {
    [mediaNotPrint]: {
      display: 'none',
    },
  },
}));

interface TableRowProps {
  label: string;
  content: string;
  className?: any;
  showCompanyInfo?: boolean;
}

const TableRowData: React.FC<TableRowProps> = ({ label, content, className, showCompanyInfo }) => {
  const classes = useStyles();
  return (
    <TableRow className={classes.tableRow}>
      <TableCell className={classes.tableCellLabel}>{label}</TableCell>
      <TableCell className={classes.tableCell}>{content}</TableCell>
    </TableRow>
  );
};

const QuoteItemHeader: React.FC<Props> = ({ quote, userData, showCompanyInfo }) => {
  //const users = useContext(UserRecords);
  const requestedBy = useUserByAlphacomId(quote.userId);

  const client = useClientById(quote.clientId);

  const clientInfo = useMemo(() => {
    return (
      <Fragment>
        {showCompanyInfo && (
          <TableRowData label="Quote For" content={client ? client.name + ', ' + client.city : quote.clientId} />
        )}
        <TableRowData
          label="Requested By"
          content={
            quote.userId
              ? requestedBy
                ? [requestedBy.firstName, requestedBy.lastName]
                    .filter(identity)
                    .map(invoke('trim'))
                    .join(' ') ||
                  requestedBy.emailAddress ||
                  quote.userId
                : quote.userId
              : quote.userNameString || ' - '
          }
        />
        <TableRowData label="" content="" />
      </Fragment>
    );
  }, [showCompanyInfo, client, quote.clientId, quote.userId, quote.userNameString, requestedBy]);

  return (
    <Table size="small" aria-label="a dense table">
      <colgroup>
        <col style={{ width: '40%' }} />
        <col style={{ width: '60%' }} />
      </colgroup>
      <TableBody>
        {clientInfo}

        <TableRowData label="" content="" />
        <TableRowData label="Quote Number" content={quote.id} />
        <TableRowData label="Quote Date" content={formatDate(quote.dateIssued, 'd. MMMM yyyy')} />
        {/*<TableRowData label="Quote Reference" content={quote.clientId} />*/}

        {quote.placeOfReceiptName && <TableRowData label="Place of Receipt" content={quote.placeOfReceiptName} />}
        <TableRowData label="Port of Loading" content={portLongFormatLabel(quote.origin)} />
        <TableRowData label="Port of Discharge" content={portLongFormatLabel(quote.destination)} />
        {quote.placeOfDeliveryName && <TableRowData label="Place of Delivery" content={quote.placeOfDeliveryName} />}
        <TableRowData label="Carrier" content={quote.carrier.name || quote.carrier.id} />

        {quote.terms
          .filter(term => term.TermLabel === 'TERMS & CONDITIONS')
          .map((term, i) => (
            <TableRowData key={i} label="Terms & Conditions" content={term.TermValue} />
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
