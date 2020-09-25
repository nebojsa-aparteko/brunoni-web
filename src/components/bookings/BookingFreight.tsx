import React, { Fragment, useContext, useMemo } from 'react';
import {
  AppBar,
  Box,
  createStyles,
  Grid,
  makeStyles,
  Tab,
  Table,
  TableCell,
  TableHead,
  TableRow,
  Tabs,
  Theme,
  Typography,
} from '@material-ui/core';
import TableBody from '@material-ui/core/TableBody';
import { FreightDetail, FreightDetailGroup } from '../../model/Booking';
import ActingAs from '../../contexts/ActingAs';
import { a11yProps, TabPanel } from '../../pages/BookingsPage';

interface Props {
  freightDetails: FreightDetail[];
}

const getSpecificFreight = (freightDetails: FreightDetail[], group: FreightDetailGroup) =>
  freightDetails.filter(f => f.Group === group);

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

const AdminBookingFreight: React.FC<Props> = ({ freightDetails }) => {
  const [value, setValue] = React.useState(0);

  const handleChange = (event: any, newValue: number) => {
    setValue(newValue);
  };
  const externalFreight = useMemo(() => getSpecificFreight(freightDetails, FreightDetailGroup.EXTERNAL), [
    freightDetails,
  ]);
  const internal1Freight = useMemo(() => getSpecificFreight(freightDetails, FreightDetailGroup.INTERNAL1), [
    freightDetails,
  ]);
  const internal2Freight = useMemo(() => getSpecificFreight(freightDetails, FreightDetailGroup.INTERNAL2), [
    freightDetails,
  ]);
  return (
    <Fragment>
      <AppBar position="static">
        <Tabs value={value} onChange={handleChange} aria-label="simple tabs example">
          <Tab label="External" {...a11yProps(0)} />
          <Tab label="Internal 1" {...a11yProps(1)} />
          <Tab label="Internal 2" {...a11yProps(2)} />
        </Tabs>
      </AppBar>
      <TabPanel value={value} index={0}>
        <BookingFreightTable freightDetails={externalFreight} />
      </TabPanel>
      <TabPanel value={value} index={1}>
        <BookingFreightTable freightDetails={internal1Freight} />
      </TabPanel>
      <TabPanel value={value} index={2}>
        <BookingFreightTable freightDetails={internal2Freight} />
      </TabPanel>
    </Fragment>
  );
};
const BookingFreightTable: React.FC<Props> = ({ freightDetails }) => {
  const classes = useStyles();
  return (
    <Grid item xs={12}>
      <Box className={classes.tableWrapper} display="flex" justifyContent="center">
        {freightDetails.length > 0 ? (
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
        ) : (
          <Typography variant="h3">No Freight Detail to show</Typography>
        )}
      </Box>
    </Grid>
  );
};

const BookingFreight: React.FC<Props> = ({ freightDetails }) => {
  const [actingAs] = useContext(ActingAs);
  return !actingAs && freightDetails.some(f => f.Group) ? (
    <AdminBookingFreight freightDetails={freightDetails} />
  ) : (
    <BookingFreightTable
      freightDetails={
        freightDetails.some(f => f.Group)
          ? freightDetails.filter(f => f.Group === FreightDetailGroup.EXTERNAL)
          : freightDetails
      }
    />
  );
};

export default BookingFreight;
