import React, { useState, Fragment, useEffect, useRef, useCallback } from 'react';
import { Box, CircularProgress, FormControl, IconButton, makeStyles, TextField } from '@material-ui/core';
import SearchIcon from '@material-ui/icons/Search';
import firebase from '../../firebase';
import { useHistory } from 'react-router';
import { Quote } from '../../providers/QuoteGroupsProvider';
import QuickSearchQuotePreview from './QuickSearchQuotePreview';
import Mousetrap from 'mousetrap';
import useNormalizeQuote from '../../hooks/useNormalizedQuote';

const useStyles = makeStyles(theme => ({
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
}));

const QuickSearchQuote: React.FC<Props> = ({ label, fieldPath, handleClose }) => {
  const classes = useStyles();
  const [inputValue, setInputValue] = useState('');
  const [searchResult, setSearchResult] = useState<Quote | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(false);
  const history = useHistory();

  const normalize = useNormalizeQuote();

  const handleQuoteClick = () => {
    history.push(`/quotes/${searchResult?.id}`);
    handleClose();
  };

  const inputRef = useRef<HTMLInputElement>();

  const handleQuoteSearch = useCallback(
    (fieldPath: string) => {
      setIsLoading(true);
      if (fieldPath === 'id') {
        firebase
          .firestore()
          .collection('quotes')
          .doc(inputValue.trim().toLowerCase())
          .get()
          .then(result => {
            if (result) {
              setSearchResult(normalize(result.data()));
            }
            setIsLoading(false);
          });
      } else {
        firebase
          .firestore()
          .collection('quotes')
          .where(fieldPath, '==', inputValue)
          .limit(1)
          .get()
          .then(result =>
            result.forEach(r => {
              setSearchResult(normalize(r.data()));
              setIsLoading(false);
            }),
          );
      }
    },
    [inputValue, normalize],
  );

  useEffect(() => {
    if (inputRef && inputRef.current) {
      inputRef.current?.focus();
      let moustrapInstance = new Mousetrap(inputRef?.current);
      moustrapInstance.stopCallback = function() {
        return false;
      };
      moustrapInstance.bind(['enter', 'enter'], () => handleQuoteSearch(fieldPath));
      return () => {
        moustrapInstance?.unbind(['enter', 'enter']);
      };
    }
  }, [inputRef, inputValue, fieldPath, handleQuoteSearch]);

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
        <IconButton
          type="submit"
          tabIndex={-1}
          aria-label="delete"
          color="primary"
          onClick={() => handleQuoteSearch(fieldPath)}
        >
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
