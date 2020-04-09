import React from 'react';
import { createStyles, makeStyles, Table, TableCell, TableHead, TableRow } from '@material-ui/core';
import { Booking } from '../../../model/Booking';
import ChecklistContent from './ChecklistContent';

interface CheckListProps {
  booking: Booking | undefined;
  showCompanyInfo?: boolean;
}

const useStyles = makeStyles(() =>
  createStyles({
    table: {
      overflowX: 'auto',
    },
    hidePrint: {
      ['@media print']: {
        display: 'none',
      },
    },
  }),
);

const CheckList: React.FC<CheckListProps> = ({ booking, showCompanyInfo }) => {
  const classes = useStyles();

  return (
    <Table className={classes.table} size="small" aria-label="a dense table">
      <TableHead>
        <TableRow>
          <TableCell align="center">&nbsp;</TableCell>
          <TableCell>&nbsp;</TableCell>
          <TableCell className={classes.hidePrint}>Customer</TableCell>
          {showCompanyInfo && <TableCell className={classes.hidePrint}>Admin</TableCell>}
        </TableRow>
      </TableHead>
      <ChecklistContent isAdmin={showCompanyInfo} booking={booking} />
    </Table>
  );
};
export default CheckList;
