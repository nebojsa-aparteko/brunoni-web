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
  Typography
} from '@material-ui/core';
import flow from 'lodash/fp/flow';
import get from 'lodash/fp/get';
import set from 'lodash/fp/set';
import chunk from 'lodash/fp/chunk';
import filter from 'lodash/fp/filter';
import reduce from 'lodash/fp/reduce';
import flatMap from 'lodash/fp/flatMap';
import Meta from './Meta';
import BookingsContext from '../contexts/Bookings';
import { QuoteListContext } from '../contexts/QuoteListContext';
import ChartsCircularProgress from './dashboard/ChartsCircularProgress';
import BookingsTable from './bookings/BookingsTable';
import  { Booking } from '../model/Booking';
import Search from './SearchBar/Search';

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
  if(typeof prop !== 'string') {
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
  const [ filteredResults, setFilteredResults ] = useState<Booking[] | undefined | null>([]);
  const [ bookingsContextData, setBookingsContextData ] = useContext(QuoteListContext);
  const { page, rowsPerPage, searchString } = bookingsContextData;

  const resultChunks = useMemo(() => {
    if( !searchString || searchString.length <= 0 ) {
      setFilteredResults(bookings);

      return chunk(rowsPerPage)(bookings);
    }

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
        ('BL-No' in booking ? containsString(booking['Cust-BkgRef'], searchString) : false)
    )(bookings);

    setFilteredResults(result);

    return chunk(rowsPerPage)(result);
  }, [bookings, rowsPerPage, searchString]);

  const handleChangePage = (event: React.MouseEvent<HTMLButtonElement> | null, page: number) => {
    setBookingsContextData(set('page', page)(bookingsContextData));
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) => {
    setBookingsContextData(
      flow(set('rowsPerPage', parseInt(event.target.value)), set('page', 0))(bookingsContextData),
    );
  };

  const handleSearch = (searchStringNew: string) => {
    if (searchStringNew !== searchString) {
      setBookingsContextData(flow(set('searchString', searchStringNew), set('page', 0))(bookingsContextData));
    }
  };

  if ( !bookings ) {
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
          <BookingsTable
            bookings={resultChunks && (get(page)(resultChunks) || [])}
            showCompanyInfo={showCompanyInfo}
          />
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
