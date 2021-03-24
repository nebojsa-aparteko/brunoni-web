import React, { Fragment, useMemo } from 'react';
import {
  Box,
  Card,
  CardActions,
  CardContent,
  CardHeader,
  Divider,
  makeStyles,
  Paper,
  TablePagination,
  Typography,
} from '@material-ui/core';
import { useBookingRequestsContext } from '../../providers/BookingRequestsProvider';
import Meta from '../Meta';
import BookingsFiltersBar from '../searchbar/BookingsFiltersBar';
import CategoryFilter from '../CategoryFilter';
import Search from '../searchbar/Search';
import BookingsEmptyResults from '../bookings/BookingsEmptyResults';
import BookingsTable from '../bookings/BookingsTable';
import get from 'lodash/fp/get';
import ChartsCircularProgress from '../dashboard/ChartsCircularProgress';
import filter from 'lodash/fp/filter';
import { Booking } from '../../model/Booking';
import containsString from '../../utilities/containsString';
import chunk from 'lodash/fp/chunk';
import { getContainersString } from '../BookingsView';
import BookingRequestsTable from './BookingRequestsTable';

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

interface Props {
  isAdmin?: boolean;
}
const BookingRequestsView: React.FC<Props> = ({ isAdmin }) => {
  const classes = useStyles();
  const [bookingRequests, isLoading] = useBookingRequestsContext();
  console.log(bookingRequests);

  return (
    <>
      <Meta title={`Booking Requests`} />

      <div>
        {bookingRequests ? (
          <Fragment>
            <Card>
              <CardHeader
                title={
                  <Box display="flex" alignItems="center">
                    <Typography variant="subtitle1" display="inline">
                      Bookings Requests
                    </Typography>
                    <Divider orientation="vertical" style={{ height: '100%' }} />
                    <Box flex={1} />
                  </Box>
                }
              />
            </Card>

            {bookingRequests.length === 0 && (
              <BookingsEmptyResults message={'There are no bookings that might need your attention at the moment. '} />
            )}

            {bookingRequests.length > 0 && (
              <Fragment>
                <CardContent className={classes.content}>
                  <BookingRequestsTable bookingRequests={bookingRequests} />
                </CardContent>

                {/*<CardActions className={classes.actions}>*/}
                {/*  {bookings && bookings.length > 0 && bookings.length > rowsPerPage && (*/}
                {/*    <TablePagination*/}
                {/*      component="div"*/}
                {/*      count={filteredResults ? filteredResults.length : 0}*/}
                {/*      onChangePage={handleChangePage}*/}
                {/*      onChangeRowsPerPage={handleChangeRowsPerPage}*/}
                {/*      page={page}*/}
                {/*      rowsPerPage={rowsPerPage}*/}
                {/*      rowsPerPageOptions={[10, 25, 50]}*/}
                {/*    />*/}
                {/*  )}*/}
                {/*</CardActions>*/}
              </Fragment>
            )}
          </Fragment>
        ) : (
          <Paper className={classes.root}>
            <ChartsCircularProgress />
          </Paper>
        )}
      </div>
    </>
  );
};

export default BookingRequestsView;
