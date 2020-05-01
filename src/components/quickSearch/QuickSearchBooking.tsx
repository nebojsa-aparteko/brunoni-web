import React, { useState, Fragment, useEffect, useRef } from 'react';
import { Box, CircularProgress, createStyles, FormControl, IconButton, makeStyles, TextField } from '@material-ui/core';
import SearchIcon from '@material-ui/icons/Search';
import firebase from '../../firebase';
import { Booking } from '../../model/Booking';
import { BookingRow } from '../bookings/BookingsTable';
import { normalizeBooking } from '../../providers/BookingsProvider';
import { useHistory } from 'react-router';
import Mousetrap from 'mousetrap';

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

const QuickSearchBooking: React.FC<Props> = ({ label, fieldPath, handleClose }) => {
  const classes = useStyles();
  const [inputValue, setInputValue] = useState('');
  const [searchResult, setSearchResult] = useState<Booking | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(false);
  const history = useHistory();

  const handleBookingClick = () => {
    history.push(`/bookings/${searchResult?.id}`);
    handleClose();
  };
  const handleBookingSearch = (fieldPath: string) => {
    setIsLoading(true);
    firebase
      .firestore()
      .collection('bookings')
      .where(fieldPath, '==', inputValue)
      .get()
      .then(result => {
        result.forEach(r => setSearchResult(normalizeBooking(r.data())));
        setIsLoading(false);
      });
  };

  const inputRef = useRef();

  useEffect(() => {
    if (inputRef) {
      let moustrapInstance = new Mousetrap(inputRef.current);
      moustrapInstance.stopCallback = function() {
        return false;
      };
      moustrapInstance.bind(['enter', 'enter'], () => handleBookingSearch(fieldPath));
      return () => {
        moustrapInstance?.unbind(['enter', 'enter']);
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
        <IconButton aria-label="delete" color="primary" tabIndex={-1} onClick={() => handleBookingSearch(fieldPath)}>
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
  fieldPath: string;
  handleClose: () => void;
}
