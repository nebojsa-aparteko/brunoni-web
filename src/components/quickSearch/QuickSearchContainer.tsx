import React, { useState, Fragment, useRef, useEffect } from 'react';
import { Box, CircularProgress, createStyles, FormControl, IconButton, makeStyles, TextField } from '@material-ui/core';
import SearchIcon from '@material-ui/icons/Search';
import firebase from '../../firebase';
import LoadListContainerModel from '../../model/LoadListContainerModel';
import { Booking } from '../../model/Booking';
import { useHistory } from 'react-router';
import { normalizeBooking } from '../../providers/BookingsProvider';
import { BookingRow } from '../bookings/BookingsTable';
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

const QuickSearchContainer: React.FC<Props> = ({ label, fieldPath, handleClose }: Props) => {
  const classes = useStyles();
  const [inputValue, setInputValue] = useState('');
  const [searchResult, setSearchResult] = useState<Booking | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(false);
  const history = useHistory();

  const handleBookingClick = () => {
    history.push(`/bookings/${searchResult?.id}`);
    handleClose();
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

  const handleBookingSearch = (fieldPath: string) => {
    setIsLoading(true);
    firebase
      .firestore()
      .collection('containers')
      .where(fieldPath, '==', inputValue)
      .get()
      .then(
        result => new Promise<string>(resolve => resolve((result.docs[0].data() as LoadListContainerModel).bookingId)),
      )
      .then(bookingId => {
        return firebase
          .firestore()
          .collection('bookings')
          .doc(bookingId)
          .get();
      })
      .then(booking => {
        setSearchResult(normalizeBooking(booking.data()));
        setIsLoading(false);
      });
  };
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
        <IconButton aria-label="delete" color="primary" onClick={() => handleBookingSearch(fieldPath)}>
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

export default QuickSearchContainer;

interface Props {
  label: string;
  fieldPath: string;
  handleClose: () => void;
}
