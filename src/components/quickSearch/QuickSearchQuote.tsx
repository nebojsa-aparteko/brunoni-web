import React, { useState, Fragment, useEffect, useRef, useCallback } from 'react';
import { Box, CircularProgress, FormControl, IconButton, makeStyles, TextField } from '@material-ui/core';
import SearchIcon from '@material-ui/icons/Search';
import firebase from '../../firebase';
import { useHistory } from 'react-router';
import { Quote } from '../../providers/QuoteGroupsProvider';
import QuickSearchQuotePreview from './QuickSearchQuotePreview';
import Mousetrap from 'mousetrap';
import useNormalizeQuote from '../../hooks/useNormalizedQuote';
import { Alert } from '@material-ui/lab';
import { useIsEligibleForQuote } from '../../hooks/useIsEligibleForQuote';

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
  const [searchResult, setSearchResult] = useState<Quote | undefined | null>();
  const [isLoading, setIsLoading] = useState(false);
  const history = useHistory();

  const isEligibleForQuote = useIsEligibleForQuote();

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
          .then(doc => {
            const quote = normalize(doc.data()) as Quote;
            if (doc.exists && isEligibleForQuote(quote)) {
              setSearchResult(quote);
              setIsLoading(false);
              return;
            }
            setSearchResult(null);
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
    [inputValue, isEligibleForQuote, normalize],
  );

  useEffect(() => {
    if (inputRef && inputRef.current && inputValue !== '') {
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
          disabled={inputValue === ''}
          onClick={() => handleQuoteSearch(fieldPath)}
        >
          <SearchIcon />
        </IconButton>
      </FormControl>
      {isLoading ? <CircularProgress color="inherit" size={20} /> : null}
      {searchResult ? (
        <Box onClick={handleQuoteClick}>
          <QuickSearchQuotePreview quote={searchResult} />
        </Box>
      ) : searchResult === null ? (
        <Alert severity="error">There is no quote with this ID</Alert>
      ) : null}
    </Fragment>
  );
};

export default QuickSearchQuote;

interface Props {
  label: string;
  fieldPath: string;
  handleClose: () => void;
}
