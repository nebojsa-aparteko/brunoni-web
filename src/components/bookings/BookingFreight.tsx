import React from 'react';
import {
  Box,
  Grid,
  Table,
  TableHead,
  TableCell,
  TableRow,
  Theme,
  createStyles,
  makeStyles
} from '@material-ui/core';
import TableBody from '@material-ui/core/TableBody';
import { FreightDetail } from '../../model/Booking';

interface Props {
  freightDetails: FreightDetail[];
}

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

const BookingFreight: React.FC<Props> = ({ freightDetails }) => {
  const classes = useStyles();

  return (
    <Grid item xs={12}>
        <Box className={classes.tableWrapper}>
          <Table className={classes.table} size="small">
            <TableHead className={classes.tableHead}>
              <TableRow className={classes.tableRow}>
                <TableCell>Description</TableCell>
                <TableCell>Anz</TableCell>
                <TableCell>Unit</TableCell>
                <TableCell>Cost</TableCell>
                <TableCell>Total</TableCell>
                <TableCell align="right">Currency</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {freightDetails.map((freight, index) => {
                return (
                  <TableRow key={`booking-freight-${index}`} className={classes.tableRow}>
                    <TableCell component="th" scope="row">{freight.Txt}</TableCell>
                    <TableCell>{freight.Anz}</TableCell>
                    <TableCell>X</TableCell>
                    <TableCell>{freight.UnitValue}</TableCell>
                    <TableCell>{freight.Total}</TableCell>
                    <TableCell align="right">{freight.Currency}</TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </Box>
      </Grid>
  );
};

export default BookingFreight;
