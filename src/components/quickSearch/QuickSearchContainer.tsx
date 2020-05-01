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
    },
    searchInput: {
      flex: 1,
    },
  }),
);

const QuickSearchContainer: React.FC<Props> = ({ label, fieldPath }: Props) => {
  const classes = useStyles();
  const [inputValue, setInputValue] = useState('');
  const handleBookingSearch = (fieldPath: string) => {
    firebase
      .firestore()
      .collection('containers')
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

export default QuickSearchContainer;

interface Props {
  label: string;
  fieldPath: string;
}
