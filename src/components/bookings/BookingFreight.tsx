import React from 'react';
import { Box, Grid, Table, TableHead, TableCell, TableRow, Theme, createStyles, makeStyles } from '@material-ui/core';
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
    // tableHead: {
    //   fontWeight: theme.typography.fontWeightBold,
    // },
    tableRow: {
      verticalAlign: 'top',
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
          <TableHead>
            <TableRow className={classes.tableRow}>
              <TableCell>Description</TableCell>
              <TableCell align="right">Quantity</TableCell>
              <TableCell align="right">Cost Unit</TableCell>
              <TableCell align="right">Cost Value</TableCell>
              <TableCell align="right">Currency</TableCell>
              <TableCell align="right">Total</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {freightDetails.map((freight, index) => {
              return (
                <TableRow
                  selected={(index + 1) % 2 === 0}
                  key={`booking-freight-${index}`}
                  className={classes.tableRow}
                >
                  <TableCell component="th" scope="row">
                    {freight.Txt}
                  </TableCell>
                  <TableCell align="right">{freight.Anz}</TableCell>
                  <TableCell align="right">{freight.Unit}</TableCell>
                  <TableCell align="right">{freight.UnitValue}</TableCell>
                  <TableCell align="right">{freight.Currency}</TableCell>
                  <TableCell align="right">{freight.Total}</TableCell>
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
