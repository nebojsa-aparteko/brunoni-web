import React, { Fragment, useEffect, useState } from 'react';
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  IconButton,
  InputLabel,
  makeStyles,
  MenuItem,
  Select,
  TextField,
  Typography,
} from '@material-ui/core';
import CloseIcon from '@material-ui/icons/Close';
import useModal from '../../hooks/useModal';
import SearchIcon from '@material-ui/icons/Search';
import ClientInput from '../inputs/ClientInput';
import useClients from '../../hooks/useClients';
import Client from '../../model/Client';
import { BookingRequestStatusText } from '../../model/BookingRequest';

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

  return (
    <Fragment>
      <FormControl className={classes.formControl}>
        <TextField
          id={`input-${label}`}
          label={label}
          margin="normal"
          variant="outlined"
          defaultValue={inputValue}
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

  return (
    <Fragment>
      <FormControl className={classes.formControl} style={{ paddingTop: 16, paddingBottom: 8 }}>
        <ClientInput
          label={label}
          clients={clients || []}
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
  const [selectedStatus, setSelectedStatus] = useState<string | undefined>(undefined);

  useEffect(() => {
    setSelectedStatus(searchField === 'statusText' ? searchValue : undefined);
  }, [searchField, searchValue]);

  const handleChange = (event: React.ChangeEvent<{ value: unknown }>) => {
    setSelectedStatus(event.target.value as string);
  };

  const handleBookingSearch = () => {
    setSearchField(fieldName);
    setSearchValue(selectedStatus);
    closeModal();
  };

  return (
    <Fragment>
      <FormControl variant="outlined" className={classes.formControl} style={{ marginTop: 16, marginBottom: 8 }}>
        <InputLabel id="search-status-label">{label}</InputLabel>
        <Select
          labelId="search-status-label"
          id="demo-simple-select-outlined"
          value={selectedStatus || ''}
          onChange={handleChange}
          className={classes.searchInput}
          // variant="outlined"
          label={label}
        >
          {Object.values(BookingRequestStatusText).map(status => (
            <MenuItem value={status}>{status}</MenuItem>
          ))}
        </Select>
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
            label="Request number"
            fieldName={'id'}
            searchField={searchField}
            setSearchField={setSearchField}
            searchValue={searchValue}
            setSearchValue={setSearchValue}
            closeModal={closeModal}
          />
          <SearchClient
            label={'Client'}
            fieldName={'client.id'}
            searchField={searchField}
            setSearchField={setSearchField}
            searchValue={searchValue}
            setSearchValue={setSearchValue}
            closeModal={closeModal}
          />
          {/*<SearchBookingRequest*/}
          {/*  label="Customer"*/}
          {/*  fieldName={'client.id'}*/}
          {/*  searchField={searchField}*/}
          {/*  setSearchField={setSearchField}*/}
          {/*  searchValue={searchValue}*/}
          {/*  setSearchValue={setSearchValue}*/}
          {/*  closeModal={closeModal}*/}
          {/*/>*/}
          <SearchBookingRequest
            label="Vessel Name"
            fieldName={'vessel'}
            searchField={searchField}
            setSearchField={setSearchField}
            searchValue={searchValue}
            setSearchValue={setSearchValue}
            closeModal={closeModal}
          />
          <SearchBookingRequest
            label="Quote Number"
            fieldName={'quoteNumber'}
            searchField={searchField}
            setSearchField={setSearchField}
            searchValue={searchValue}
            setSearchValue={setSearchValue}
            closeModal={closeModal}
          />
          <SearchStatus
            label="Status"
            fieldName={'statusText'}
            searchField={searchField}
            setSearchField={setSearchField}
            searchValue={searchValue}
            setSearchValue={setSearchValue}
            closeModal={closeModal}
          />
          <SearchBookingRequest
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
