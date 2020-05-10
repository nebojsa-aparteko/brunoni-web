import React, { useState, Fragment, useEffect, useRef } from 'react';
import {
  Box,
  CircularProgress,
  createStyles,
  FormControl,
  IconButton,
  makeStyles,
  TextField,
  Typography,
} from '@material-ui/core';
import SearchIcon from '@material-ui/icons/Search';
import firebase from '../../firebase';
import { Booking } from '../../model/Booking';
import { BookingRow } from '../bookings/BookingsTable';
import { normalizeBooking } from '../../providers/BookingsProvider';
import { useHistory } from 'react-router';
import Mousetrap from 'mousetrap';
import { useSnackbar } from 'notistack';

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
  }),
);

const QuickSearchBooking: React.FC<Props> = ({ label, handleClose, searchBookings }) => {
  const classes = useStyles();
  const [inputValue, setInputValue] = useState('');
  const [searchResult, setSearchResult] = useState<Booking | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(false);
  const history = useHistory();
  const { enqueueSnackbar } = useSnackbar();

  const handleBookingClick = () => {
    history.push(`/bookings/${searchResult?.id}`);
    handleClose();
  };
  const handleBookingSearch = () => {
    setIsLoading(true);
    searchBookings(inputValue)
      .then(result => {
        console.log('Got Results ', result);
        setSearchResult(normalizeBooking(result));
        setIsLoading(false);
      })
      .catch(error => {
        console.log('got error ', error);
        setIsLoading(false);
        enqueueSnackbar(<Typography color="inherit">{`There is no record with this criteria.`}</Typography>, {
          variant: 'error',
        });
      });
  };

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
  }, [inputRef, inputValue]);

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
        <Box onClick={handleBookingClick}>
          <BookingRow booking={searchResult} />
        </Box>
      )}
    </Fragment>
  );
};

export default QuickSearchBooking;

interface Props {
  label: string;
  handleClose: () => void;
  searchBookings: (inputValue: string) => Promise<Booking | undefined>;
}
