import React, { useEffect, useMemo, useRef } from 'react';
import classNames from 'classnames';
import { makeStyles } from '@material-ui/styles';
import { Input, Theme, InputAdornment, IconButton, FormControl } from '@material-ui/core';
import SearchIcon from '@material-ui/icons/Search';
import ClearIcon from '@material-ui/icons/Clear';
import debounce from 'lodash/fp/debounce';
import useLocalStorage from '../../utilities/useLocalStorage';

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    display: 'flex',
    alignItems: 'center',
  },
  search: {
    flexGrow: 1,
    height: 42,
    padding: theme.spacing(0, 2),
    display: 'flex',
    alignItems: 'center',
  },
  searchIcon: {
    marginRight: theme.spacing(2),
    // color: theme.palette.icon
  },
  searchInput: {
    flexGrow: 1,
    borderBottomStyle: 'solid',
    borderBottomWidth: '1px',
    borderBottomColor: theme.palette.primary.dark,
  },
  searchButton: {
    backgroundColor: theme.palette.common.white,
    marginLeft: theme.spacing(2),
  },
  textField: {
    width: 200,
  },
}));

interface Props {
  className?: string;
  style?: React.CSSProperties;
  onSearch: (searchString: string) => void;
  localStorageKey?: string;
}

const Search: React.FC<Props> = ({
  onSearch,
  localStorageKey = 'quoteSearchQuery',
  className,
  style,
}) => {
  const classes = useStyles();
  const input = useRef<HTMLInputElement>();
  const [searchString, setSearchString] = useLocalStorage(localStorageKey, '', false, 15);

  const startSearch = useMemo(() => debounce(250, onSearch), [onSearch]);

  useEffect(() => {
    startSearch(searchString);
  }, [searchString, startSearch]);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchString(event.target.value);
  };

  const handleClearButton = () => {
    setSearchString('');
    if (input && input.current) {
      input.current.focus();
    }
  };

  return (
    <FormControl className={classNames(classes.textField, className)} style={style}>
      <Input
        className={classes.searchInput}
        disableUnderline
        inputRef={input}
        placeholder="Search"
        onChange={handleChange}
        value={searchString}
        startAdornment={
          <InputAdornment position="start">
            <SearchIcon />
          </InputAdornment>
        }
        endAdornment={
          searchString.length > 0 && (
            <InputAdornment position="end">
              <IconButton onClick={handleClearButton}>
                <ClearIcon />
              </IconButton>
            </InputAdornment>
          )
        }
      />
    </FormControl>
  );
};

export default Search;
