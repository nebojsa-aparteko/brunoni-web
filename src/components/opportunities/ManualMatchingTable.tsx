import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  makeStyles,
  Typography,
} from '@material-ui/core';

const useStyles = makeStyles(theme => ({
  table: {
    minWidth: 650,
  },
  tableContainer: {
    marginTop: theme.spacing(2),
  },
  headerCell: {
    fontWeight: 'bold',
    backgroundColor: theme.palette.grey[50],
  },
  emptyMessage: {
    textAlign: 'center',
    padding: theme.spacing(4),
    color: theme.palette.text.secondary,
  },
}));

export interface SortConfig {
  key: string;
  direction: 'asc' | 'desc';
}

interface Props {
  sortConfig?: SortConfig;
  onSort?: (key: string) => void;
}

const ManualMatchingTable: React.FC<Props> = ({ sortConfig, onSort }) => {
  const classes = useStyles();

  // Empty table for now - will be populated with booking/quote data later
  return (
    <TableContainer component={Paper} className={classes.tableContainer}>
      <Table className={classes.table} aria-label="manual matching table">
        <TableHead>
          <TableRow>
            <TableCell className={classes.headerCell}>Entity Type</TableCell>
            <TableCell className={classes.headerCell}>Entity ID</TableCell>
            <TableCell className={classes.headerCell}>Booking Party</TableCell>
            <TableCell className={classes.headerCell}>Match Status</TableCell>
            <TableCell className={classes.headerCell}>Probability</TableCell>
            <TableCell className={classes.headerCell}>Created At</TableCell>
            <TableCell className={classes.headerCell}>Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          <TableRow>
            <TableCell colSpan={7}>
              <Typography variant="body1" className={classes.emptyMessage}>
                No manual matching data available. This table will display bookings and quotes
                matched with opportunities.
              </Typography>
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default ManualMatchingTable;
