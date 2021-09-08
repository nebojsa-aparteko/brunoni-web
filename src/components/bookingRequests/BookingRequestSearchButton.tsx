import React, { Fragment, useContext, useEffect, useMemo, useRef, useState } from 'react';
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  IconButton,
  makeStyles,
  TextField,
  Typography,
} from '@material-ui/core';
import CloseIcon from '@material-ui/icons/Close';
import useModal from '../../hooks/useModal';
import SearchIcon from '@material-ui/icons/Search';
import ClientInput from '../inputs/ClientInput';
import useClients from '../../hooks/useClients';
import Client from '../../model/Client';
import { BookingRequestStatusCode, BookingRequestStatusText } from '../../model/BookingRequest';
import Mousetrap from 'mousetrap';
import SelectInput from '../inputs/SelectInput';
import ActingAs from '../../contexts/ActingAs';
import { useBookingRequestsFilterContext } from '../../providers/BookingRequestsFilterProvider';

const useStyles = makeStyles(theme => ({
  closeModal: {
    position: 'absolute',
    top: '5px',
    right: '12px',
    width: '47px',
    height: '47px',
  },
  dialogBody: {
    minWidth: theme.spacing(100),
    width: 'auto',
  },
  dialogContent: {
    paddingBottom: theme.spacing(3),
    display: 'flex',
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
    flexDirection: 'column',
  },
  formControl: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
  },
  searchInput: {
    flex: 1,
  },
}));

interface SearchBookingRequestProps {
  label: string;
  fieldName: string;
  searchValue: any;
  setSearchValue: (value: any) => void;
  searchField?: string;
  setSearchField: (value: string | undefined) => void;
  closeModal: () => void;
}

const SearchBookingRequest: React.FC<SearchBookingRequestProps> = ({
  label,
  fieldName,
  searchField,
  setSearchField,
  searchValue,
  setSearchValue,
  closeModal,
}) => {
  const classes = useStyles();
  const [inputValue, setInputValue] = useState(searchField === fieldName ? searchValue || '' : '');

  const handleBookingSearch = () => {
    setSearchField(fieldName);
    setSearchValue(inputValue);
    closeModal();
  };

  useEffect(() => {
    setInputValue(searchField === fieldName ? searchValue || '' : '');
  }, [fieldName, searchField]);

  const inputRef = useRef();

  useEffect(() => {
    if (inputRef && inputRef) {
      let mousetrapInstance = new Mousetrap(inputRef.current);
      mousetrapInstance.stopCallback = function() {
        return false;
      };
      mousetrapInstance.bind(['enter', 'enter'], () => handleBookingSearch());
      return () => {
        mousetrapInstance?.unbind(['enter', 'enter']);
      };
    }
  }, [inputRef, handleBookingSearch]);

  return (
    <Fragment>
      <FormControl className={classes.formControl}>
        <TextField
          id={`input-${label}`}
          label={label}
          margin="normal"
          variant="outlined"
          defaultValue={inputValue}
          inputRef={inputRef}
          className={classes.searchInput}
          onChange={event => setInputValue(event.target.value)}
        />
        <IconButton aria-label="delete" color="primary" tabIndex={-1} onClick={() => handleBookingSearch()}>
          <SearchIcon />
        </IconButton>
      </FormControl>
    </Fragment>
  );
};

const SearchClient: React.FC<SearchBookingRequestProps> = ({
  label,
  fieldName,
  searchField,
  setSearchField,
  searchValue,
  setSearchValue,
  closeModal,
}) => {
  const classes = useStyles();
  const clients = useClients();
  const [selectedClient, setSelectedClient] = useState<Client | undefined>(undefined);

  useEffect(() => {
    setSelectedClient(searchField === 'client.id' ? clients?.find(client => client.id === searchValue) : undefined);
  }, [searchField, searchValue]);

  const handleBookingSearch = () => {
    setSearchField(fieldName);
    setSearchValue(selectedClient?.id);
    closeModal();
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
  }, [inputRef, selectedClient?.id, handleBookingSearch]);

  return (
    <Fragment>
      <FormControl className={classes.formControl} style={{ paddingTop: 16, paddingBottom: 8 }}>
        <ClientInput
          label={label}
          clients={clients || []}
          inputRef={inputRef}
          onChange={client => setSelectedClient(client || undefined)}
          value={selectedClient}
        />
        <IconButton aria-label="delete" color="primary" tabIndex={-1} onClick={() => handleBookingSearch()}>
          <SearchIcon />
        </IconButton>
      </FormControl>
    </Fragment>
  );
};

const SearchStatus: React.FC<SearchBookingRequestProps> = ({
  label,
  fieldName,
  searchField,
  setSearchField,
  searchValue,
  setSearchValue,
  closeModal,
}) => {
  const classes = useStyles();
  const [open, setOpen] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<string | undefined>(undefined);
  const [filters] = useBookingRequestsFilterContext();
  const statuses = useMemo(
    () =>
      filters.maxStatusCode && filters.maxStatusCode === BookingRequestStatusCode.IN_PROGRESS
        ? [BookingRequestStatusText.REQUESTED, BookingRequestStatusText.IN_PROGRESS]
        : filters.minStatusCode && filters.minStatusCode === BookingRequestStatusCode.CONFIRMED
        ? [BookingRequestStatusText.CONFIRMED, BookingRequestStatusText.ARCHIVED]
        : Object.values(BookingRequestStatusText),
    [filters.minStatusCode, filters.maxStatusCode],
  );

  useEffect(() => {
    setSelectedStatus(searchField === 'statusText' ? searchValue : undefined);
  }, [searchField, searchValue]);

  const handleChange = (value: string | null) => {
    setSelectedStatus(value || undefined);
  };

  const handleBookingSearch = () => {
    setSearchField(fieldName);
    setSearchValue(selectedStatus);
    closeModal();
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
  }, [inputRef, selectedStatus, handleBookingSearch]);

  return (
    <Fragment>
      <FormControl className={classes.formControl} style={{ marginTop: 16, marginBottom: 8 }}>
        <Box flex={1}>
          <SelectInput
            label={label}
            options={statuses}
            getOptionLabel={event => event}
            open={open}
            setOpen={setOpen}
            value={selectedStatus || ''}
            onChange={handleChange}
            inputRef={inputRef}
          />
        </Box>
        <IconButton aria-label="delete" color="primary" tabIndex={-1} onClick={() => handleBookingSearch()}>
          <SearchIcon />
        </IconButton>
      </FormControl>
    </Fragment>
  );
};

interface SearchDialogProps {
  isOpen: boolean;
  closeModal: () => void;
  searchValue: any;
  setSearchValue: (value: any) => void;
  searchField?: string;
  setSearchField: (value: string | undefined) => void;
}

const SearchDialog: React.FC<SearchDialogProps> = ({
  isOpen,
  closeModal,
  searchField,
  setSearchField,
  searchValue,
  setSearchValue,
}) => {
  const classes = useStyles();
  const [actingAs] = useContext(ActingAs);
  const isAdmin = !actingAs;

  const handleClearFields = () => {
    setSearchValue(undefined);
    setSearchField(undefined);
    closeModal();
  };
  return (
    <Dialog open={isOpen} onClose={closeModal} aria-labelledby="dialog-title-navBar-quick-search" maxWidth="xl">
      <Box className={classes.dialogBody}>
        <DialogTitle disableTypography id="dialog-title-check-list">
          <Typography variant="h4">Search</Typography>
          <IconButton onClick={closeModal} className={classes.closeModal}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent className={classes.dialogContent}>
          <SearchBookingRequest
            key="id"
            label="Request number"
            fieldName={'id'}
            searchField={searchField}
            setSearchField={setSearchField}
            searchValue={searchValue}
            setSearchValue={setSearchValue}
            closeModal={closeModal}
          />
          {isAdmin && (
            <SearchClient
              key="client.id"
              label={'Client'}
              fieldName={'client.id'}
              searchField={searchField}
              setSearchField={setSearchField}
              searchValue={searchValue}
              setSearchValue={setSearchValue}
              closeModal={closeModal}
            />
          )}
          <SearchBookingRequest
            key="vessel"
            label="Vessel Name"
            fieldName={'vessel'}
            searchField={searchField}
            setSearchField={setSearchField}
            searchValue={searchValue}
            setSearchValue={setSearchValue}
            closeModal={closeModal}
          />
          {isAdmin && (
            <SearchBookingRequest
              key="quoteNumber"
              label="Quote Number"
              fieldName={'quoteNumber'}
              searchField={searchField}
              setSearchField={setSearchField}
              searchValue={searchValue}
              setSearchValue={setSearchValue}
              closeModal={closeModal}
            />
          )}
          <SearchStatus
            key="statusText"
            label="Status"
            fieldName={'statusText'}
            searchField={searchField}
            setSearchField={setSearchField}
            searchValue={searchValue}
            setSearchValue={setSearchValue}
            closeModal={closeModal}
          />
          <SearchBookingRequest
            key="customerReference"
            label="Customer ref"
            fieldName={'customerReference'}
            searchField={searchField}
            setSearchField={setSearchField}
            searchValue={searchValue}
            setSearchValue={setSearchValue}
            closeModal={closeModal}
          />
        </DialogContent>
        {searchValue && (
          <DialogActions style={{ display: 'flex' }}>
            <Button
              onClick={handleClearFields}
              variant="contained"
              color="primary"
              style={{ backgroundColor: '#cd0000', fontWeight: 900, margin: 'auto' }}
            >
              Clear Fields
            </Button>
          </DialogActions>
        )}
      </Box>
    </Dialog>
  );
};

interface SearchButtonProps {
  searchValue: any;
  setSearchValue: (value: any) => void;
  searchField?: string;
  setSearchField: (value: string | undefined) => void;
}
const BookingRequestSearchButton: React.FC<SearchButtonProps> = ({
  searchField,
  setSearchField,
  searchValue,
  setSearchValue,
}) => {
  const { isOpen, openModal, closeModal } = useModal();

  return (
    <Fragment>
      <IconButton
        onClick={openModal}
        onMouseDown={e => e.preventDefault()}
        style={{ backgroundColor: searchField || searchValue ? 'rgba(255,103,95,0.15)' : undefined }}
      >
        <SearchIcon fontSize="large" />
      </IconButton>
      {isOpen && (
        <SearchDialog
          isOpen={isOpen}
          closeModal={closeModal}
          searchField={searchField}
          setSearchField={setSearchField}
          searchValue={searchValue}
          setSearchValue={setSearchValue}
        />
      )}
    </Fragment>
  );
};

export default BookingRequestSearchButton;
