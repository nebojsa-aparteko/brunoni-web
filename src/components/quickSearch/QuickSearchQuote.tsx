import React, { useState, Fragment } from 'react';
import { Box, CircularProgress, createStyles, FormControl, IconButton, makeStyles, TextField } from '@material-ui/core';
import SearchIcon from '@material-ui/icons/Search';
import firebase from '../../firebase';
import { BookingRow } from '../bookings/BookingsTable';
import { Booking } from '../../model/Booking';
import { useHistory } from 'react-router';
import { Quote } from '../../providers/QuoteGroupsProvider';
import QuickSearchQuotePreview from './QuickSearchQuotePreview';

const useStyles = makeStyles(theme =>
  createStyles({
    formControl: {
      display: 'flex',
      flexDirection: 'row',
      alignItems: 'center',
      '& *': {
        margin: `0 ${theme.spacing(1)}`,
      },
    },
    searchInput: {
      flex: 1,
    },
  }),
);

const QuickSearchQuote: React.FC<Props> = ({ label, fieldPath, handleClose }) => {
  const classes = useStyles();
  const [inputValue, setInputValue] = useState('');
  const [searchResult, setSearchResult] = useState<Quote | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(false);
  const history = useHistory();

  const handleQuoteClick = () => {
    history.push(`/quotes/${searchResult?.id}`);
    handleClose();
  };
  const handleQuoteSearch = (fieldPath: string) => {
    firebase
      .firestore()
      .collection('quotes')
      .where(fieldPath, '==', inputValue)
      .get()
      .then(result => result.forEach(r => console.log(r.data(), 'Doc')));
  };
  return (
    <Fragment>
      <FormControl className={classes.formControl}>
        <TextField
          id={`input-${label}`}
          label={label}
          margin="normal"
          variant="outlined"
          className={classes.searchInput}
          onChange={event => setInputValue(event.target.value)}
        />
        <IconButton aria-label="delete" color="primary" onClick={() => handleQuoteSearch(fieldPath)}>
          <SearchIcon />
        </IconButton>
      </FormControl>
      {isLoading ? <CircularProgress color="inherit" size={20} /> : null}
      {!isLoading && searchResult && (
        <Box onClick={handleQuoteClick}>
          <QuickSearchQuotePreview quote={searchResult} />
        </Box>
      )}
    </Fragment>
  );
};

export default QuickSearchQuote;

interface Props {
  label: string;
  fieldPath: string;
  handleClose: () => void;
}
