import React, { Fragment, useContext, useMemo, useState } from 'react';
import {
  Box,
  makeStyles,
  Container as MUIContainer,
  Paper,
  Card,
  CardContent,
  CardHeader,
  CardActions,
  TablePagination,
  Typography,
  Grid,
} from '@material-ui/core';
import flow from 'lodash/fp/flow';
import get from 'lodash/fp/get';
import set from 'lodash/fp/set';
import chunk from 'lodash/fp/chunk';
import filter from 'lodash/fp/filter';
import reduce from 'lodash/fp/reduce';
import flatMap from 'lodash/fp/flatMap';
import orderBy from 'lodash/orderBy';
import Meta from './Meta';
import BookingsContext from '../contexts/Bookings';
import { QuoteListContext } from '../contexts/QuoteListContext';
import ChartsCircularProgress from './dashboard/ChartsCircularProgress';
import BookingsTable from './bookings/BookingsTable';
import { Booking } from '../model/Booking';
import Search from './SearchBar/Search';
import useClients from '../hooks/useClients';
import Ports from '../contexts/Ports';
import { DateRange } from './DateRangePicker/types';
import Port from '../model/Port';
import Client from '../model/Client';
import FiltersBar from './SearchBar/FiltersBar';
import compareAsc from 'date-fns/compareAsc';
import compareDesc from 'date-fns/compareDesc';
import addDays from 'date-fns/addDays';
import parseISO from 'date-fns/parseISO';

interface Props {
  showCompanyInfo?: boolean;
}

const useStyles = makeStyles(theme => ({
  root: {
    marginTop: theme.spacing(4),
    marginBottom: theme.spacing(4),
    padding: theme.spacing(5),

    [theme.breakpoints.down('sm')]: {
      padding: theme.spacing(2),
      paddingTop: theme.spacing(3),
    },

    ['@media print']: {
      marginTop: theme.spacing(0),
      paddingTop: theme.spacing(0),
    },
  },
  content: {
    padding: 0,
    overflowX: 'auto',
  },
  inner: {
    minWidth: 700,
  },
  nameCell: {
    display: 'flex',
    alignItems: 'center',
  },
  avatar: {
    height: 42,
    width: 42,
    marginRight: theme.spacing(1),
  },
  actions: {
    padding: theme.spacing(1),
    justifyContent: 'flex-end',
  },
}));

const containsString = (prop: string, searchString: string) => {
  // TODO: Fix API response and remove the condition
  if (typeof prop !== 'string') {
    return false;
  }

  const byMultiple = flatMap((value: string) => prop?.toLowerCase().indexOf(value.toLowerCase()) !== -1)(
    searchString.split(' '),
  );
  return reduce((one: boolean, other: boolean) => one && other, true)(byMultiple);
};

const Bookings: React.FC<Props> = ({ showCompanyInfo }) => {
  const classes = useStyles();
  const bookings = useContext(BookingsContext);
  const clients = useClients();
  const ports = useContext(Ports);

  const [dateRange, setDateRange] = useState<DateRange>();

  const [bookingsContextData, setBookingsContextData] = useContext(QuoteListContext);

  const { searchString, page, rowsPerPage, clientFilter, originPort, destinationPort } = bookingsContextData;

  const [filteredResults, setFilteredResults] = useState<Booking[] | undefined | null>([]);

  const resultChunks = useMemo(() => {
    // order bookings by date
    const sortedBookings = orderBy(bookings, (booking: Booking) => new Date(booking.TimeStamp), ['desc']);

    const filteredBookings = filter(
      (booking: Booking) =>
        (clientFilter ? booking.ForwAdrId === clientFilter.id : true) &&
        (originPort ? booking.POL === originPort.id : true) &&
        (destinationPort ? booking.POD === destinationPort.id : true) &&
        compareAsc(new Date(booking.TimeStamp), dateRange?.startDate || new Date(1970, 1, 1)) !== -1 &&
        compareDesc(new Date(booking.TimeStamp), dateRange?.endDate || addDays(new Date(), 1)) !== -1,
    )(sortedBookings);

    // if( !searchString || searchString.length <= 0 ) {
    //   setFilteredResults(filteredBookings);
    //
    //   return chunk(rowsPerPage)(filteredBookings);
    // }

    const result = filter(
      // TODO:
      // container number
      // bill of landing number
      // release reference
      // deliver reference
      // customer name/surname
      // company name, incl. place

      (booking: Booking) =>
        // voyage number
        (booking.Voyage ? containsString(booking.Voyage, searchString) : false) ||
        // vessel
        (booking.Vessel ? containsString(booking.Vessel, searchString) : false) ||
        // destionation (place of delivery)
        (booking.FinalDestinationName ? containsString(booking.FinalDestinationName, searchString) : false) ||
        // destionation (port of discharge)
        (booking.PODName ? containsString(booking.PODName, searchString) : false) ||
        // origin (place of receipt)
        (booking.PlaceOfRecieptName ? containsString(booking.PlaceOfRecieptName, searchString) : false) ||
        // origin (port of loading)
        (booking.POLName ? containsString(booking.POLName, searchString) : false) ||
        // container number
        (booking.CargoDetails ? containsString(booking.POLName, searchString) : false) ||
        // customer reference
        ('Cust-BkgRef' in booking ? containsString(booking['Cust-BkgRef'], searchString) : false) ||
        // booking number
        ('BL-No' in booking ? containsString(booking['Cust-BkgRef'], searchString) : false),
    )(filteredBookings);

    setFilteredResults(result);

    return chunk(rowsPerPage)(result);
  }, [bookings, searchString, page, rowsPerPage, dateRange, clientFilter, originPort, destinationPort]);

  const handleChangePage = (event: React.MouseEvent<HTMLButtonElement> | null, page: number) => {
    setBookingsContextData(set('page', page)(bookingsContextData));
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) => {
    setBookingsContextData(flow(set('rowsPerPage', parseInt(event.target.value)), set('page', 0))(bookingsContextData));
  };

  const handleSearch = (searchStringNew: string) => {
    if (searchStringNew !== searchString) {
      setBookingsContextData(flow(set('searchString', searchStringNew), set('page', 0))(bookingsContextData));
    }
  };

  if (!bookings) {
    return (
      <MUIContainer maxWidth="lg">
        <Paper className={classes.root}>
          <ChartsCircularProgress />
        </Paper>
      </MUIContainer>
    );
  }

  return (
    <Fragment>
      <Meta title={'Bookings'} />

      <FiltersBar
        listContextData={bookingsContextData}
        setQuoteListContextData={setBookingsContextData}
        showCompanyInfo={showCompanyInfo}
        dateRange={dateRange}
        setDateRange={setDateRange}
      />

      <Card>
        <CardHeader
          title={
            <Box display="flex" alignItems="center">
              <Typography variant="subtitle1" display="inline">
                Bookings
              </Typography>

              <Box flex={1} />

              <Search
                onSearch={handleSearch}
                style={{ visibility: bookings && bookings.length > 0 ? 'initial' : 'hidden' }}
              />
            </Box>
          }
        />

        <CardContent className={classes.content}>
          <BookingsTable bookings={resultChunks && (get(page)(resultChunks) || [])} showCompanyInfo={showCompanyInfo} />
        </CardContent>

        <CardActions className={classes.actions}>
          {bookings && bookings.length > 0 && (
            <TablePagination
              component="div"
              count={filteredResults ? filteredResults.length : 0}
              onChangePage={handleChangePage}
              onChangeRowsPerPage={handleChangeRowsPerPage}
              page={page}
              rowsPerPage={rowsPerPage}
              rowsPerPageOptions={[5, 10, 25]}
            />
          )}
        </CardActions>
      </Card>
    </Fragment>
  );
};

export default Bookings;
