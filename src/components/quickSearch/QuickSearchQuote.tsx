import React, { useState } from 'react';
import { createStyles, FormControl, IconButton, makeStyles, TextField } from '@material-ui/core';
import SearchIcon from '@material-ui/icons/Search';
import firebase from '../../firebase';

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

const QuickSearchQuote: React.FC<Props> = ({ label, fieldPath }) => {
  const classes = useStyles();
  const [inputValue, setInputValue] = useState('');
  const handleBookingSearch = (fieldPath: string) => {
    firebase
      .firestore()
      .collection('quotes')
      .where(fieldPath, '==', inputValue)
      .get()
      .then(result => result.forEach(r => console.log(r.data(), 'Doc')));
  };
  return (
    <FormControl className={classes.formControl}>
      <TextField
        id={`input-${label}`}
        label={label}
        margin="normal"
        variant="outlined"
        className={classes.searchInput}
        onChange={event => setInputValue(event.target.value)}
      />
      <IconButton aria-label="delete" color="primary" onClick={() => handleBookingSearch(fieldPath)}>
        <SearchIcon />
      </IconButton>
    </FormControl>
  );
};

export default QuickSearchQuote;

interface Props {
  label: string;
  fieldPath: string;
}
