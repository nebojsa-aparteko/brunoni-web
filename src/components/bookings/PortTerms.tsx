import React, { Fragment } from 'react';
import {
  Box,
  createStyles,
  makeStyles,
  Table,
  TableCell,
  TableHead,
  TableRow,
  Theme,
} from '@material-ui/core';
import TableBody from '@material-ui/core/TableBody';
import { PortTerms } from '../../model/Booking';

const mediaPrint = '@media print';
const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      width: '100%',
    },
    paper: {
      marginTop: theme.spacing(3),
      width: '100%',
      overflowX: 'auto',
      marginBottom: theme.spacing(2),
    },
    tableCellLabel: {
      paddingLeft: 0,
      border: 'none',
      fontWeight: 700,
      maxWidth: '8em',
    },
    tableCell: {
      border: 'none',
    },
    table: {
      minWidth: 650,
      overflowX: 'auto',
    },
    tableHead: {
      fontWeight: theme.typography.fontWeightBold,
    },
    portTermsTable: {
      width: '100%',
    },
    costUnitCell: {
      paddingLeft: 0,
      minWidth: '150px',
    },
    tableRow: {
      verticalAlign: 'top',
      [mediaPrint]: {
        '& td': {
          padding: theme.spacing(0),
        },
      },
    },
    tableWrapper: {
      overflowX: 'auto',
    },
  }),
);

interface Props {
  portTerms: PortTerms;
}

interface TableRowProps {
  label: string;
  content: string;
  className?: any;
}

const TableRowData: React.FC<TableRowProps> = ({ label, content }) => {
  const classes = useStyles();

  return (
    <TableRow className={classes.tableRow}>
      <TableCell className={classes.tableCellLabel}>{label}</TableCell>
      <TableCell className={classes.tableCell} dangerouslySetInnerHTML={{ __html: content }} />
    </TableRow>
  );
};

const PortTermsDetails: React.FC<Props> = ({ portTerms }) => {
  const classes = useStyles();

  return (
    <Fragment>
      <Table size="small" aria-label="a dense table" className={classes.portTermsTable}>
        <colgroup>
          <col style={{ width: '14%' }} />
          <col style={{ width: '86%' }} />
        </colgroup>
        <TableBody>
          <TableRowData label={'Liner Port Agent'} content={portTerms.LinerPortAgent} />
          <TableRowData label={'FOB Delivery By'} content={portTerms.FOBDeliveryBy} />
          <TableRowData label={'VGM Submission By'} content={portTerms.VGMSubmByTxt} />
        </TableBody>
      </Table>

      <Box className={classes.tableWrapper} marginTop="1em" marginBottom="1em">
        <Table className={classes.table} size="small">
          <TableHead className={classes.tableHead}>
            <TableRow className={classes.tableRow}>
              <TableCell>Closing for</TableCell>
              <TableCell>Date/Time</TableCell>
              <TableCell>Remarks</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {portTerms.Closings &&
              portTerms.Closings.map((item, index) => {
                return (
                  <TableRow key={`booking-closing-${index}`} className={classes.tableRow}>
                    <TableCell>{item.ClosingType}</TableCell>
                    {item.ClosingTime ? (
                      <TableCell
                        style={{ minWidth: '13em' }}
                      >{`${item.ClosingDate} - ${item.ClosingTime}h`}</TableCell>
                    ) : (
                      <TableCell>{item.ClosingDate}</TableCell>
                    )}
                    <TableCell>
                      {item.ClosingType !== 'DELIVERY' ? item.ClosingTxt : null}
                    </TableCell>
                  </TableRow>
                );
              })}
          </TableBody>
        </Table>
      </Box>
    </Fragment>
  );
};

export default PortTermsDetails;
