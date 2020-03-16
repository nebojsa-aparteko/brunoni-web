import React from 'react';
import {
  createStyles,
  Theme,
  Table,
  TableHead,
  TableCell,
  TableRow,
  makeStyles
} from '@material-ui/core';
import TableBody from '@material-ui/core/TableBody';

interface Props {}

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
    table: {
      minWidth: 650,
      overflowX: 'auto',
    },
    tableHead: {
      fontWeight: theme.typography.fontWeightBold,
    },
    costUnitCell: {
      paddingLeft: 0,
      minWidth: '150px',
    },
    tableRow: {
      '& td': {
        whiteSpace: 'nowrap',
      },
      ['@media print']: {
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

const ExportChecklist: React.FC<Props> = () => {
  const classes = useStyles();

  return (
    <Table className={classes.table} size="small">
      <TableHead className={classes.tableHead}>
        <TableRow className={classes.tableRow}>
          <TableCell>&nbsp;</TableCell>
          <TableCell>CHECK LIST</TableCell>
          <TableCell>&nbsp;</TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        <TableRow selected={false} className={classes.tableRow}>
          <TableCell>Depot Out</TableCell>
          <TableCell>OK</TableCell>
          <TableCell></TableCell>
        </TableRow>
        <TableRow selected={true} className={classes.tableRow}>
          <TableCell>Gate In Terminal</TableCell>
          <TableCell>OK</TableCell>
          <TableCell></TableCell>
        </TableRow>
        <TableRow selected={false} className={classes.tableRow}>
          <TableCell>VGM Submission</TableCell>
          <TableCell>OK</TableCell>
          <TableCell></TableCell>
        </TableRow>
        <TableRow selected={true} className={classes.tableRow}>
          <TableCell>Shipping Instructions</TableCell>
          <TableCell>OK</TableCell>
          <TableCell></TableCell>
        </TableRow>
        <TableRow selected={false} className={classes.tableRow}>
          <TableCell>B/L Draft Received</TableCell>
          <TableCell>OK</TableCell>
          <TableCell></TableCell>
        </TableRow>
        <TableRow selected={true} className={classes.tableRow}>
          <TableCell>B/L Draft Approved</TableCell>
          <TableCell>OK</TableCell>
          <TableCell></TableCell>
        </TableRow>
        <TableRow selected={false} className={classes.tableRow}>
          <TableCell>Shipped on Board</TableCell>
          <TableCell>PENDING</TableCell>
          <TableCell></TableCell>
        </TableRow>
        <TableRow selected={true} className={classes.tableRow}>
          <TableCell>Final B/L Copy</TableCell>
          <TableCell>PENDING</TableCell>
          <TableCell></TableCell>
        </TableRow>
      </TableBody>
    </Table>
  );
};

export default ExportChecklist;
