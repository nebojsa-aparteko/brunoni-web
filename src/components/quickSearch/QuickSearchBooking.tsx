import React, { Fragment, useCallback, useContext, useEffect, useRef, useState } from 'react';
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
import { GlobalContext } from '../../store/GlobalStore';
import { SHOW_ERROR_SNACKBAR } from '../../store/types/globalAppState';
import firebase from '../../firebase';

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

const searchBookings = async (bookingIds: string[] | undefined) => {
  if (bookingIds && bookingIds.length > 0)
    return firebase
      .firestore()
      .collection('bookings')
      .where('id', 'in', bookingIds)
      .get()
      .then(bookings => {
        return new Promise<Booking[]>(resolve =>
          resolve(bookings.docs.map(_ => normalizeBooking(_.data() as Booking))),
        );
      })
      .catch(error => {
        return new Promise<Booking[]>((resolve, reject) => reject(error));
      });
  return undefined;
};

const QuickSearchBooking: React.FC<Props> = ({ label, getBookingChunks }) => {
  const classes = useStyles();
  const [inputValue, setInputValue] = useState('');
  const [searchIDs, setSearchIDs] = useState<string[][]>();
  const [searchResult, setSearchResult] = useState<Booking[] | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(false);
  const [, dispatch] = useContext(GlobalContext);
  const [page, setPage] = useState<number>(0);
  const [numberOfResults, setNumberOfResults] = useState(0);
  const actingAs = useContext(ActingAs)[0];

  const handleChangePage = (event: React.MouseEvent<HTMLButtonElement> | null, page: number) => {
    event?.stopPropagation();
    setPage(page);
    searchIDs &&
      searchBookings(searchIDs[page]).then(result => {
        setSearchResult(result || []);
      });
  };

  const handleBookingClick = (index: number) => {
    searchResult && searchResult[index] && window.open(`/bookings/${searchResult[index].id}`);
  };

  const handleBookingSearch = useCallback(() => {
    setIsLoading(true);
    getBookingChunks(inputValue)
      .then(foundBookingIds => {
        setNumberOfResults(foundBookingIds?.length || 0);
        const chunkedIds = chunk(10)(foundBookingIds);
        setSearchIDs(chunkedIds);
        setPage(0);
        foundBookingIds &&
          foundBookingIds.length > 0 &&
          searchBookings(chunkedIds[0]).then(bookings => {
            setSearchResult(bookings || []);
          });
      })
      .catch(error => {
        console.log('got error ', error);
        setIsLoading(false);
        dispatch({
          type: SHOW_ERROR_SNACKBAR,
          message: `There is no record with this criteria.`,
        });
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [inputValue, dispatch, getBookingChunks]);

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
      {isLoading && !searchResult ? <CircularProgress color="inherit" size={20} /> : null}
      {!isLoading && searchResult && (
        <Box>
          <CardContent className={classes.content}>
            {searchResult &&
              searchResult.map((result, index) => (
                <Box key={index} onClick={() => handleBookingClick(index)}>
                  <BookingRow booking={searchResult[index]} isAdmin={!actingAs} preventDefaultClick />
                  <Divider />
                </Box>
              ))}
          </CardContent>

          <CardActions className={classes.actions}>
            {searchResult && searchResult.length > 0 && numberOfResults > 10 && (
              <TablePagination
                component="div"
                count={numberOfResults}
                onChangePage={handleChangePage}
                page={page}
                rowsPerPage={10}
                rowsPerPageOptions={[10]}
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
  getBookingChunks: (inputValue: string) => Promise<string[] | undefined>;
}
