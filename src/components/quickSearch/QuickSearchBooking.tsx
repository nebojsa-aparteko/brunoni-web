import React, { Fragment, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import {
  Box,
  CardActions,
  CardContent,
  CircularProgress,
  createStyles,
  Divider,
  FormControl,
  IconButton,
  makeStyles,
  TablePagination,
  TextField,
} from '@material-ui/core';
import SearchIcon from '@material-ui/icons/Search';
import { Booking } from '../../model/Booking';
import { BookingRow } from '../bookings/BookingsTable';
import { normalizeBooking } from '../../providers/BookingsProvider';
import Mousetrap from 'mousetrap';
import ActingAs from '../../contexts/ActingAs';
import chunk from 'lodash/fp/chunk';
import { useBookingListPaginationContext } from '../../providers/BookingListPaginationProvider';
import get from 'lodash/fp/get';
import set from 'lodash/fp/set';
import flow from 'lodash/fp/flow';
import { GlobalContext } from '../../store/GlobalStore';
import { SHOW_ERROR_SNACKBAR } from '../../store/types/globalAppState';

const useStyles = makeStyles(theme =>
  createStyles({
    formControl: {
      display: 'flex',
      flexDirection: 'row',
      alignItems: 'center',
    },
    searchInput: {
      flex: 1,
    },
    content: {
      padding: 0,
      overflowX: 'auto',
    },
    actions: {
      padding: theme.spacing(1),
      justifyContent: 'flex-end',
    },
  }),
);

const QuickSearchBooking: React.FC<Props> = ({ label, searchBookings }) => {
  const classes = useStyles();
  const [inputValue, setInputValue] = useState('');
  const [searchResult, setSearchResult] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [, dispatch] = useContext(GlobalContext);
  const actingAs = useContext(ActingAs)[0];
  const [bookingPaginationContextData, setBookingPaginationContextData] = useBookingListPaginationContext();
  const { page, rowsPerPage } = bookingPaginationContextData;

  const handleChangePage = useCallback(
    (event: React.MouseEvent<HTMLButtonElement> | null, page: number) => {
      if (setBookingPaginationContextData)
        setBookingPaginationContextData(set('page', page)(bookingPaginationContextData));
    },
    [setBookingPaginationContextData, bookingPaginationContextData],
  );

  const handleChangeRowsPerPage = useCallback(
    (event: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) => {
      if (setBookingPaginationContextData)
        setBookingPaginationContextData(
          flow(set('rowsPerPage', parseInt(event.target.value)), set('page', 0))(bookingPaginationContextData),
        );
    },
    [setBookingPaginationContextData, bookingPaginationContextData],
  );

  const handleBookingClick = (index: number) => {
    window.open(`/bookings/${searchResult[index].id}`);
  };
  const handleBookingSearch = useCallback(() => {
    setIsLoading(true);
    searchBookings(inputValue)
      .then(result => {
        console.log('Got Results ', result);
        setSearchResult([].concat(normalizeBooking(result)));
        setIsLoading(false);
      })
      .catch(error => {
        console.log('got error ', error);
        setIsLoading(false);
        dispatch({
          type: SHOW_ERROR_SNACKBAR,
          message: `There is no record with this criteria.`,
        });
      });
  }, [inputValue, dispatch, searchBookings]);
  const resultChunks = useMemo(() => {
    return chunk(rowsPerPage)(searchResult);
  }, [searchResult, rowsPerPage]);

  const inputRef = useRef();

  useEffect(() => {
    if (inputRef) {
      let mousetrapInstance = new Mousetrap(inputRef.current);
      mousetrapInstance.stopCallback = function() {
        return false;
      };
      mousetrapInstance.bind(['enter', 'enter'], () => handleBookingSearch());
      return () => {
        mousetrapInstance?.unbind(['enter', 'enter']);
      };
    }
  }, [inputRef, inputValue, handleBookingSearch]);

  return (
    <Fragment>
      <FormControl className={classes.formControl}>
        <TextField
          id={`input-${label}`}
          label={label}
          margin="normal"
          variant="outlined"
          inputRef={inputRef}
          className={classes.searchInput}
          onChange={event => setInputValue(event.target.value)}
        />
        <IconButton aria-label="delete" color="primary" tabIndex={-1} onClick={() => handleBookingSearch()}>
          <SearchIcon />
        </IconButton>
      </FormControl>
      {isLoading ? <CircularProgress color="inherit" size={20} /> : null}
      {!isLoading && searchResult && (
        <Box>
          <CardContent className={classes.content}>
            {resultChunks &&
              (get(page)(resultChunks) || []).map((result, index) => (
                <Box key={index} onClick={() => handleBookingClick(index)}>
                  <BookingRow booking={searchResult[index]} isAdmin={!actingAs} preventDefaultClick />
                  <Divider />
                </Box>
              ))}
          </CardContent>

          <CardActions className={classes.actions}>
            {searchResult && searchResult.length > rowsPerPage && (
              <TablePagination
                component="div"
                count={searchResult ? searchResult.length : 0}
                onChangePage={handleChangePage}
                onChangeRowsPerPage={handleChangeRowsPerPage}
                page={page}
                rowsPerPage={rowsPerPage}
                rowsPerPageOptions={[3, 5, 10, 25]}
              />
            )}
          </CardActions>
        </Box>
      )}
    </Fragment>
  );
};

export default QuickSearchBooking;

interface Props {
  label: string;
  searchBookings: (inputValue: string) => Promise<Booking[] | undefined>;
}
