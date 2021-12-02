import React, { Dispatch, SetStateAction, useEffect, useState } from 'react';
import {
  Box,
  Button,
  Card,
  CardActions,
  CardHeader,
  Checkbox,
  Dialog,
  DialogContent,
  DialogTitle,
  Divider,
  Grid,
  IconButton,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  makeStyles,
  TablePagination,
  Typography,
} from '@material-ui/core';
import CloseIcon from '@material-ui/icons/Close';
import RouteFromCity from '../../model/RouteFromCity';
import firebase from '../../firebase';
import ChartsCircularProgress from '../dashboard/ChartsCircularProgress';
import useGlobalAppState from '../../hooks/useGlobalAppState';
import sortBy from 'lodash/sortBy';
import SingleCountryInput from './SingleCountryInput';
import Country from '../../model/Country';
import SimpleSearch from '../SimpleSearch';
import Destination from '../../model/land-transport/Destination';
import useModal from '../../hooks/useModal';

const useStyles = makeStyles(() => ({
  closeModal: {
    position: 'absolute',
    top: '5px',
    right: '12px',
    width: '47px',
    height: '47px',
  },
  dialogContent: {
    display: 'flex',
    height: '85vh',
  },
  actions: {
    padding: 0,
    margin: 0,
    justifyContent: 'flex-end',
  },
}));

interface RoutesListProps {
  title: string;
  items?: RouteFromCity[];
  selectedItems: RouteFromCity[];
  onSelect: (route: RouteFromCity) => void;
  setSelected: Dispatch<SetStateAction<RouteFromCity[]>>;
}

// TODO Make this searchable and selectable list component reusable
const RoutesList: React.FC<RoutesListProps> = ({ title, items, selectedItems, onSelect, setSelected }) => {
  const classes = useStyles();
  const [filteredItems, setFilteredItems] = useState(items);
  const [searchStringState, setSearchStringState] = useState('');
  const [selectedCountry, setSelectedCountry] = useState<Country | null>(null);
  const [pageItems, setPageItems] = useState(items);
  const [page, setPage] = useState<number>(0);
  const [numberOfResults, setNumberOfResults] = useState(0);

  const handleToggleAll = () => {
    setSelected(prevState => (prevState.length === filteredItems?.length ? [] : filteredItems || []));
  };

  const handleChangePage = (event: React.MouseEvent<HTMLButtonElement> | null, page: number) => {
    event?.stopPropagation();
    setPage(page);
  };

  useEffect(() => {
    setPage(0);
    // setFilteredItems(
    //   items?.filter(item =>
    //     selectedCountry
    //       ? item.countryCode === selectedCountry.countryCode &&
    //         item.name.toLowerCase().includes(searchStringState.toLowerCase())
    //       : item.name.toLowerCase().includes(searchStringState.toLowerCase()),
    //   ),
    // );
  }, [items, selectedCountry, setFilteredItems, searchStringState, setPage]);

  useEffect(() => {
    setNumberOfResults(filteredItems?.length || 0);
    setPageItems(
      filteredItems && filteredItems.length > 10 ? filteredItems?.slice(page * 10, page * 10 + 9) : filteredItems,
    );
  }, [filteredItems, page]);

  const handleSearch = (searchString: string) => {
    setSearchStringState(searchString);
  };

  return (
    <Card style={{ maxHeight: '100%', display: 'flex', flexDirection: 'column' }}>
      <CardHeader
        sx={{ px: 2, py: 1, display: 'flex' }}
        avatar={
          <Checkbox
            onClick={handleToggleAll}
            checked={selectedItems.length === items?.length && items?.length !== 0}
            indeterminate={selectedItems.length !== items?.length && selectedItems.length !== 0}
            disabled={items?.length === 0}
            inputProps={{
              'aria-label': 'all items selected',
            }}
          />
        }
        title={title}
        subheader={`${selectedItems.length} routes selected`}
        action={<SingleCountryInput margin="dense" value={(selectedCountry || null)!} onChange={setSelectedCountry} />}
      />
      <Divider />
      <SimpleSearch onSearch={handleSearch} localStorageKey={`semiAutomaticRoutes${title}`} style={{ width: '100%' }} />
      <Divider />
      {pageItems ? (
        <List
          style={{
            maxHeight: '100%',
            backgroundColor: 'background.paper',
            overflow: 'scroll',
          }}
          dense
          component="div"
          role="list"
        >
          {pageItems.map(value => {
            const labelId = `transfer-list-all-item-${value}-label`;

            return (
              <ListItem key={`${new Date()}`} role="listitem" button onClick={() => onSelect(value)}>
                <ListItemIcon>
                  <Checkbox
                    // checked={selectedItems.some(route => route.id === value.id)}
                    tabIndex={-1}
                    disableRipple
                    inputProps={{
                      'aria-labelledby': labelId,
                    }}
                  />
                </ListItemIcon>
                <ListItemText
                  id={labelId}
                  // primary={`${value.name}, ${value.countryCode}`}
                  secondary={value.distance ? `${value.distance} km` : undefined}
                />
              </ListItem>
            );
          })}
          <ListItem />
        </List>
      ) : (
        <ChartsCircularProgress />
      )}
      <CardActions className={classes.actions}>
        {filteredItems && filteredItems.length > 0 && numberOfResults > 10 && (
          <TablePagination
            component="div"
            count={numberOfResults}
            onChangePage={handleChangePage}
            page={page}
            rowsPerPage={10}
            rowsPerPageOptions={[10]}
            variant="footer"
            size="small"
          />
        )}
      </CardActions>
    </Card>
  );
};

interface Props {
  isEditing: boolean;
  startingDestination?: Destination;
  selectedRoutes: RouteFromCity[];
  setSelectedRoutes: Dispatch<SetStateAction<RouteFromCity[]>>;
}

const handleFetchData = async (countryId?: string, startCityId?: string) => {
  if (!countryId || !startCityId) return null;
  try {
    const docRefs = await firebase
      .firestore()
      .collection(`countries/${countryId}/cities`)
      .doc(startCityId)
      .collection('routes')
      .orderBy('name')
      .get();

    return docRefs?.docs.map(
      v =>
        ({
          ...v.data(),
          // id: v.id,
        } as RouteFromCity),
    );
  } catch (error) {
    console.error('useFirestoreCollection threw an error', error);
    return null;
  }
};

const RoutesMultiInput: React.FC<Props> = ({ startingDestination, selectedRoutes, setSelectedRoutes, isEditing }) => {
  const classes = useStyles();
  const [, dispatch] = useGlobalAppState();
  const [routesState, setRoutesState] = useState<RouteFromCity[] | undefined>(undefined);
  const { openModal, closeModal, isOpen } = useModal();
  const [checkedAvailableRoutes, setCheckedAvailableRoutes] = useState<RouteFromCity[]>([]);
  const [checkedSelectedRoutes, setCheckedSelectedRoutes] = useState<RouteFromCity[]>([]);
  const [selectedCountries, setSelectedCountries] = useState<string[]>([]);

  // useEffect(() => {
  //   setSelectedCountries(
  //     selectedRoutes
  //       .map(route => route.country?.countryCode)
  //       .filter((value, index, self) => self.indexOf(value) === index),
  //   );
  // }, [selectedRoutes]);

  const handleOpenDialog = async () => {
    dispatch({ type: 'START_GLOBAL_LOADING' });
    setRoutesState(
      (await handleFetchData(startingDestination?.country.countryCode, startingDestination?.city?.id))?.filter(
        route => !selectedRoutes.some((r: RouteFromCity) => r.city.id === route.city.id),
      ) || undefined,
    );
    dispatch({ type: 'STOP_GLOBAL_LOADING' });
    openModal();
  };

  const handleAddCheckedToSelected = () => {
    setSelectedRoutes(prevState => sortBy(prevState.concat(checkedAvailableRoutes), ['name']));
    // setRoutesState(prevState =>
    //   prevState?.filter(route => !checkedAvailableRoutes.some((r: RouteFromCity) => r.id === route.id)),
    // );
    setCheckedAvailableRoutes([]);
  };

  const handleRemoveSelected = () => {
    setRoutesState(prevState => sortBy((prevState || []).concat(checkedSelectedRoutes), ['name']));
    setSelectedRoutes(prevState =>
      prevState?.filter(route => !checkedSelectedRoutes.some((r: RouteFromCity) => r.city.id === route.city.id)),
    );
    setCheckedSelectedRoutes([]);
  };

  const handleCheckLeft = (value: RouteFromCity) => {
    setCheckedAvailableRoutes(prevState =>
      prevState.includes(value) ? prevState.filter(a => a.city.id !== value.city.id) : prevState.concat(value),
    );
  };

  const handleSelectRight = (value: RouteFromCity) => {
    setCheckedSelectedRoutes(prevState =>
      prevState.includes(value) ? prevState.filter(a => a.city.id !== value.city.id) : prevState.concat(value),
    );
  };

  return (
    <Box display="flex" flexDirection="row">
      {isEditing ? (
        <Button
          variant="outlined"
          onClick={handleOpenDialog}
          disabled={!startingDestination?.city}
          style={{ height: 38, marginTop: 4 }}
        >
          {selectedRoutes?.length > 0
            ? `${selectedRoutes.length} cities in ${selectedCountries.join(', ')}`
            : 'Select Routes'}
        </Button>
      ) : (
        <Typography>
          {selectedRoutes?.length > 0
            ? `${selectedRoutes.length} cities in ${selectedCountries.join(', ')}`
            : '0 routes selected'}
        </Typography>
      )}
      {isOpen && (
        <Dialog
          open={isOpen}
          keepMounted
          onClose={closeModal}
          maxWidth="lg"
          fullWidth
          aria-labelledby="alert-dialog-slide-title"
          aria-describedby="alert-dialog-slide-description"
        >
          <DialogTitle disableTypography>
            <Typography variant="h4">{'Select the desired routes'}</Typography>
            <IconButton onClick={closeModal} className={classes.closeModal}>
              <CloseIcon />
            </IconButton>
          </DialogTitle>
          <DialogContent className={classes.dialogContent}>
            <Grid container spacing={2} style={{ display: 'flex', flex: 1, height: '100%' }}>
              <Grid item xs={5} style={{ maxHeight: '100%' }}>
                <RoutesList
                  title={'Available Routes'}
                  items={routesState || []}
                  selectedItems={checkedAvailableRoutes}
                  onSelect={handleCheckLeft}
                  setSelected={setCheckedAvailableRoutes}
                />
              </Grid>
              <Grid
                item
                xs={2}
                style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}
              >
                <Grid container direction="column" alignItems="center" style={{ maxHeight: '100%' }}>
                  <Button
                    variant="outlined"
                    size="small"
                    onClick={handleAddCheckedToSelected}
                    disabled={checkedAvailableRoutes.length === 0}
                    aria-label="move selected right"
                  >
                    &gt;
                  </Button>
                  <Button
                    variant="outlined"
                    size="small"
                    onClick={handleRemoveSelected}
                    disabled={checkedSelectedRoutes.length === 0}
                    aria-label="move selected left"
                  >
                    &lt;
                  </Button>
                </Grid>
              </Grid>
              <Grid item xs={5} style={{ maxHeight: '100%' }}>
                <RoutesList
                  title={'Selected Routes'}
                  items={selectedRoutes}
                  selectedItems={checkedSelectedRoutes}
                  onSelect={handleSelectRight}
                  setSelected={setCheckedSelectedRoutes}
                />
              </Grid>
            </Grid>
          </DialogContent>
        </Dialog>
      )}
    </Box>
  );
};

export default RoutesMultiInput;
