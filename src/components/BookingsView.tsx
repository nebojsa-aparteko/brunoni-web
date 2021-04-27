import React, { Fragment, useCallback, useMemo, useState } from 'react';
import {
  Box,
  makeStyles,
  Divider,
  Paper,
  Card,
  CardContent,
  CardHeader,
  CardActions,
  TablePagination,
  Typography,
} from '@material-ui/core';
import flow from 'lodash/fp/flow';
import get from 'lodash/fp/get';
import set from 'lodash/fp/set';
import chunk from 'lodash/fp/chunk';
import filter from 'lodash/fp/filter';
import Meta from './Meta';
import { useBookingListFilterContext } from '../providers/BookingListFilterProvider';
import ChartsCircularProgress from './dashboard/ChartsCircularProgress';
import BookingsTable from './bookings/BookingsTable';
import { Booking } from '../model/Booking';
import Search from './searchbar/Search';
import containsString from '../utilities/containsString';
import BookingsFiltersBar from './searchbar/BookingsFiltersBar';
import BookingsEmptyResults from './bookings/BookingsEmptyResults';
import CategoryFilter from './CategoryFilter';
import { useBookingListPaginationContext } from '../providers/BookingListPaginationProvider';

interface Props {
  bookings?: Booking[];
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

const BookingsView: React.FC<Props> = ({ isAdmin, bookings, archived, showDateRangeFilter }) => {
  const classes = useStyles();

  const [filters, setFilters] = useBookingListFilterContext();

  const [bookingPaginationContextData, setBookingPaginationContextData] = useBookingListPaginationContext();

  const { assignee } = filters;
  const { searchString, page, rowsPerPage } = bookingPaginationContextData;

  const [filteredResults, setFilteredResults] = useState<Booking[] | undefined | null>([]);

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
    setFilters && setFilters(set('category', (event.target as HTMLInputElement).value)(filters));
  };

  const handleChangePage = useCallback(
    (event: React.MouseEvent<HTMLButtonElement> | null, page: number) => {
      if (setBookingPaginationContextData)
        setBookingPaginationContextData(set('page', page)(bookingPaginationContextData));
    },
    [setBookingPaginationContextData],
  );

  const handleChangeRowsPerPage = useCallback(
    (event: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) => {
      if (setBookingPaginationContextData)
        setBookingPaginationContextData(
          flow(set('rowsPerPage', parseInt(event.target.value)), set('page', 0))(bookingPaginationContextData),
        );
    },
    [setBookingPaginationContextData],
  );

  const handleSearch = useCallback(
    (searchStringNew: string) => {
      if (searchStringNew !== searchString && setBookingPaginationContextData) {
        setBookingPaginationContextData(
          flow(set('searchString', searchStringNew), set('page', 0))(bookingPaginationContextData),
        );
      }
    },
    [setBookingPaginationContextData, searchString],
  );

  // if (!bookings) {
  //   return (
  //     <Paper className={classes.root}>
  //       <ChartsCircularProgress/>
  //     </Paper>
  //   );
  // }

  // console.log('bookings ', chunk(10)(bookings?.map(item => [item['ERP-BkgRef'], item.pendingPayment])));

  return (
    <Fragment>
      <Meta title={`Bookings`} />

      <BookingsFiltersBar
        filters={filters}
        setFilters={setFilters}
        showClientFilter={isAdmin}
        showDateRange={showDateRangeFilter}
        showAssigneeFilter={isAdmin}
      />

      <div>
        {bookings ? (
          <Fragment>
            <Card>
              <CardHeader
                title={
                  <Box display="flex" alignItems="center">
                    <Typography variant="subtitle1" display="inline">
                      Bookings {archived && '- Archive'}
                    </Typography>
                    <Divider orientation="vertical" style={{ height: '100%' }} />
                    <div id="exportImportBkgView">
                      <CategoryFilter value={filters.category} onChange={handleImportOrExportChange} />
                    </div>
                    <Box flex={1} />

                    <Search
                      onSearch={handleSearch}
                      style={{ visibility: bookings && bookings.length > 0 ? 'initial' : 'hidden' }}
                    />
                  </Box>
                }
              />
            </Card>

            {bookings.length === 0 && (
              <BookingsEmptyResults
                message={
                  assignee
                    ? 'There are no bookings that might need your attention at the moment. ' +
                      'You can use filters bar or quick search (ctrl+g on keyboard) to find what you might be looking for.'
                    : 'No bookings found for your filter criteria. Try changing filters.'
                }
              />
            )}
            {bookings.length > 0 && (
              <Fragment>
                <CardContent className={classes.content}>
                  <BookingsTable bookings={resultChunks && (get(page)(resultChunks) || [])} isAdmin={isAdmin} />
                </CardContent>

                <CardActions className={classes.actions}>
                  {bookings && bookings.length > 0 && bookings.length > rowsPerPage && (
                    <TablePagination
                      component="div"
                      count={filteredResults ? filteredResults.length : 0}
                      onChangePage={handleChangePage}
                      onChangeRowsPerPage={handleChangeRowsPerPage}
                      page={page}
                      rowsPerPage={rowsPerPage}
                      rowsPerPageOptions={[10, 25, 50]}
                    />
                  )}
                </CardActions>
              </Fragment>
            )}
          </Fragment>
        ) : (
          <Paper className={classes.root}>
            <ChartsCircularProgress />
          </Paper>
        )}
      </div>
    </Fragment>
  );
};

export default BookingsView;
