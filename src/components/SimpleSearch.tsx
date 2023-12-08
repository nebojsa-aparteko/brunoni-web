import { makeStyles } from '@material-ui/styles';
import { FormControl, IconButton, Input, InputAdornment, Theme } from '@material-ui/core';
import React, { useRef, useState } from 'react';
import classNames from 'classnames';
import SearchIcon from '@material-ui/icons/Search';
import ClearIcon from '@material-ui/icons/Clear';

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
  placeholderText?: string;
  className?: string;
  style?: React.CSSProperties;
  onSearch: (searchString: string) => void;
  localStorageKey?: string;
}

const SimpleSearch: React.FC<Props> = ({ placeholderText, onSearch, className, style }) => {
  const classes = useStyles();
  const input = useRef<HTMLInputElement>();
  const [searchString, setSearchString] = useState<string | undefined>(undefined);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchString(event.target.value);
    onSearch(event.target.value);
  };

  const handleClearButton = () => {
    setSearchString('');
    if (input && input.current) {
      input.current.focus();
    }
    onSearch('');
  };

  return (
    <FormControl className={classNames(classes.textField, className)} style={style}>
      <Input
        className={classes.searchInput}
        disableUnderline
        inputRef={input}
        placeholder={placeholderText}
        onChange={handleChange}
        value={searchString}
        startAdornment={
          <InputAdornment position="start" style={{ paddingLeft: 8 }}>
            <SearchIcon />
          </InputAdornment>
        }
        endAdornment={
          searchString &&
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

export default SimpleSearch;
