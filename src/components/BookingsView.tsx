import React, { Fragment, useCallback, useContext, useMemo, useState } from 'react';
import {
  Box,
  makeStyles,
  Container as MUIContainer,
  Divider,
  Paper,
  Card,
  CardContent,
  CardHeader,
  CardActions,
  TablePagination,
  Typography,
  RadioGroup,
  FormControlLabel,
  Radio,
} from '@material-ui/core';
import flow from 'lodash/fp/flow';
import get from 'lodash/fp/get';
import set from 'lodash/fp/set';
import chunk from 'lodash/fp/chunk';
import filter from 'lodash/fp/filter';
import Meta from './Meta';
import { BookingListFilterContext } from '../providers/BookingListFilterProvider';
import ChartsCircularProgress from './dashboard/ChartsCircularProgress';
import BookingsTable from './bookings/BookingsTable';
import { Booking } from '../model/Booking';
import Search from './searchbar/Search';
import containsString from '../utilities/containsString';
import { BookingContextFilters, useBookingsFilterDispatch } from '../providers/BookingsProvider';
import BookingsFiltersBar from './searchbar/BookingsFiltersBar';

interface Props {
  bookings?: Booking[];
  bookingContextFilters: BookingContextFilters;
  isAdmin?: boolean;
  archived?: boolean;
  showDateRangeFilter?: boolean;
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
  importOrExport: {
    flexDirection: 'row',
    marginLeft: theme.spacing(4),
  },
}));

export const getContainersString = (booking: Booking) => {
  return booking.CargoDetails.map(cargoDetail =>
    cargoDetail.Equipment && cargoDetail.Equipment[0]
      ? cargoDetail.Equipment.map(equipment => (equipment.ContainerNumber ? '/' + equipment.ContainerNumber : '')).join(
          '',
        )
      : '',
  )
    .join('')
    .substring(1)
    .split('/');
};

const BookingsView: React.FC<Props> = ({ isAdmin, bookings, bookingContextFilters, archived, showDateRangeFilter }) => {
  const classes = useStyles();

  const [bookingsContextData, setBookingsContextData] = useContext(BookingListFilterContext);

  const { searchString, page, rowsPerPage } = bookingsContextData;

  const [filteredResults, setFilteredResults] = useState<Booking[] | undefined | null>([]);

  const bookingFilterDispach = useBookingsFilterDispatch();

  const resultChunks = useMemo(() => {
    const result = filter(
      // TODO:
      // container number
      // bill of landing number
      // release reference
      // deliver reference
      // customer name/surname
      // company name, incl. place

      (booking: Booking) =>
        // booking id
        (booking.id ? containsString(booking.id, searchString) : false) ||
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
        (booking.CargoDetails && booking.CargoDetails[0]
          ? getContainersString(booking).some(containerString => containsString(containerString, searchString))
          : false) ||
        // customer reference
        ('Cust-BkgRef' in booking ? containsString(booking['Cust-BkgRef'], searchString) : false) ||
        // booking number
        ('BL-No' in booking ? containsString(booking['BL-No'], searchString) : false),
    )(bookings);

    setFilteredResults(result);

    return chunk(rowsPerPage)(result);
  }, [bookings, searchString, page, rowsPerPage]);

  const handleImportOrExportChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    bookingFilterDispach({ type: 'set', field: 'category', value: (event.target as HTMLInputElement).value });
  };

  const handleChangePage = useCallback(
    (event: React.MouseEvent<HTMLButtonElement> | null, page: number) => {
      setBookingsContextData(set('page', page)(bookingsContextData));
    },
    [setBookingsContextData, bookingsContextData],
  );

  const handleChangeRowsPerPage = useCallback(
    (event: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) => {
      setBookingsContextData(
        flow(set('rowsPerPage', parseInt(event.target.value)), set('page', 0))(bookingsContextData),
      );
    },
    [setBookingsContextData, bookingsContextData],
  );

  const handleSearch = useCallback(
    (searchStringNew: string) => {
      if (searchStringNew !== searchString) {
        setBookingsContextData(flow(set('searchString', searchStringNew), set('page', 0))(bookingsContextData));
      }
    },
    [setBookingsContextData, bookingsContextData, searchString],
  );

  if (!bookings) {
    return (
      <MUIContainer maxWidth="md">
        <Paper className={classes.root}>
          <ChartsCircularProgress />
        </Paper>
      </MUIContainer>
    );
  }

  return (
    <Fragment>
      <Meta title={`Bookings`} />

      <BookingsFiltersBar showClientFilter={isAdmin} showDateRange={showDateRangeFilter} showAssigneeFilter />

      <Card>
        <CardHeader
          title={
            <Box display="flex" alignItems="center">
              <Typography variant="subtitle1" display="inline">
                Bookings {archived && '- Archive'}
              </Typography>
              <Divider orientation="vertical" style={{ height: '100%' }} />
              <RadioGroup
                aria-label="importexport"
                name="importexport"
                value={bookingContextFilters.category}
                onChange={handleImportOrExportChange}
                className={classes.importOrExport}
              >
                <FormControlLabel value="Export" control={<Radio />} label="Export" />
                <FormControlLabel value="Import" control={<Radio />} label="Import/Crosstrade" />
              </RadioGroup>

              <Box flex={1} />

              <Search
                onSearch={handleSearch}
                style={{ visibility: bookings && bookings.length > 0 ? 'initial' : 'hidden' }}
              />
            </Box>
          }
        />

        <CardContent className={classes.content}>
          <BookingsTable bookings={resultChunks && (get(page)(resultChunks) || [])} isAdmin={isAdmin} />
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

export default BookingsView;
