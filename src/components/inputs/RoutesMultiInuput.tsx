import React, { useEffect, useMemo, useState } from 'react';
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
import ChartsCircularProgress from '../dashboard/ChartsCircularProgress';
import SingleCountryInput from './SingleCountryInput';
import Country from '../../model/Country';
import SimpleSearch from '../SimpleSearch';
import Destination from '../../model/land-transport/Destination';
import useModal from '../../hooks/useModal';
import useDistanceBetweenCities from '../../hooks/useDistanceBetweenCities';
import { drop, flow, get, has, omit, set, sortBy, take } from 'lodash/fp';
import { useLandTransportSemiAutomaticContext } from '../../providers/LandTransportSemiAutomaticProvider';

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
  selectedItems: { [key: string]: RouteFromCity };
  onSelect: (route: RouteFromCity) => void;
  onSelectAll: () => void;
}

// TODO Make this searchable and selectable list component reusable
const RoutesList: React.FC<RoutesListProps> = ({
  title,
  items,
  selectedItems,
  onSelect,
  onSelectAll,
}) => {
  const classes = useStyles();
  const [searchStringState, setSearchStringState] = useState('');
  const [selectedCountry, setSelectedCountry] = useState<Country | null>(null);
  const [page, setPage] = useState<number>(0);
  const filteredItems = useMemo(
    () =>
      items
        ? items.filter(value => {
            let temp = true;
            if (selectedCountry) {
              temp = value.countryCode === selectedCountry.countryCode;
            }
            return temp && value.name.toLowerCase().includes(searchStringState.toLowerCase());
          })
        : [],
    [items, searchStringState, selectedCountry],
  );
  const numberOfResults = useMemo(() => filteredItems.length || 0, [filteredItems]);

  const paginatedItems = useMemo(
    () => flow(drop(page * 10), take(10))(filteredItems),
    [filteredItems, page],
  );

  const handleChangePage = (event: React.MouseEvent<HTMLButtonElement> | null, page: number) => {
    event?.stopPropagation();
    setPage(page);
  };

  useEffect(() => {
    setPage(0);
  }, [filteredItems]);

  const handleSearch = (searchString: string) => {
    setSearchStringState(searchString);
  };

  return (
    <Card style={{ maxHeight: '100%', display: 'flex', flexDirection: 'column' }}>
      <CardHeader
        sx={{ px: 2, py: 1, display: 'flex' }}
        avatar={
          <Checkbox
            onClick={onSelectAll}
            checked={Boolean(
              Object.keys(selectedItems).length === items?.length && items?.length !== 0,
            )}
            indeterminate={
              Object.keys(selectedItems).length !== items?.length &&
              Object.keys(selectedItems).length !== 0
            }
            disabled={items?.length === 0}
            inputProps={{
              'aria-label': 'all items selected',
            }}
          />
        }
        title={title}
        subheader={`${Object.keys(selectedItems).length} routes selected`}
        action={
          <SingleCountryInput
            margin="dense"
            value={(selectedCountry || null)!}
            onChange={setSelectedCountry}
          />
        }
      />
      <Divider />
      <SimpleSearch onSearch={handleSearch} style={{ width: '100%' }} />
      {paginatedItems ? (
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
          {paginatedItems.map(value => {
            const labelId = `transfer-list-all-item-${value}-label`;

            return (
              <ListItem key={value.id} role="listitem" button onClick={() => onSelect(value)}>
                <ListItemIcon>
                  <Checkbox
                    checked={Boolean(get(value.id)(selectedItems))}
                    tabIndex={-1}
                    disableRipple
                    inputProps={{
                      'aria-labelledby': labelId,
                    }}
                  />
                </ListItemIcon>
                <ListItemText
                  id={labelId}
                  primary={`${value.name}, ${value.countryCode}`}
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
      <Divider />
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
  startingDestination: Destination | null;
}

export const RoutesMultiInput: React.FC<Props> = ({ startingDestination, isEditing }) => {
  const { openModal, closeModal, isOpen } = useModal();
  const [selectedRoutes] = useLandTransportSemiAutomaticContext();
  const selectedCountries = useMemo(
    () =>
      selectedRoutes.reduce((previousValue, currentValue) => {
        if (!previousValue.includes(currentValue.countryCode)) {
          previousValue.push(currentValue.countryCode);
        }
        return previousValue;
      }, [] as string[]),
    [selectedRoutes],
  );
  return (
    <Box display="flex" flexDirection="row">
      {isEditing ? (
        <Button
          variant="outlined"
          onClick={openModal}
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
      {isOpen && startingDestination?.country.countryCode && startingDestination?.city.id && (
        <RouteSelectingModal
          isOpen={isOpen}
          closeModal={closeModal}
          countryId={startingDestination?.country.countryCode}
          startCityId={startingDestination?.city.id}
        />
      )}
    </Box>
  );
};

interface RouteSelectingModalProps {
  isOpen: boolean;
  closeModal: () => void;
  countryId: string;
  startCityId: string;
}

type SelectedItems = { [key: string]: RouteFromCity };

const RouteSelectingModal: React.FC<RouteSelectingModalProps> = ({
  closeModal,
  isOpen,
  countryId,
  startCityId,
}) => {
  const classes = useStyles();
  // get routes
  const distances = useDistanceBetweenCities(countryId, startCityId);

  const [selectedDistances, setSelectedDistances] = useLandTransportSemiAutomaticContext();
  const [checkedAvailableRoutes, setCheckedAvailableRoutes] = useState<SelectedItems>({});
  const [checkedSelectedRoutes, setCheckedSelectedRoutes] = useState<SelectedItems>({});
  const filteredDistances = useMemo(
    () =>
      distances?.filter(val => selectedDistances.findIndex(value => val.id === value.id) === -1),
    [distances, selectedDistances],
  );
  const handleCheck = (value: RouteFromCity, direction: 'left' | 'right') => {
    (direction === 'left' ? setCheckedAvailableRoutes : setCheckedSelectedRoutes)(prevState => {
      if (has(value.id)(prevState)) {
        return omit(value.id)(prevState) as SelectedItems;
      } else {
        return set(value.id, value)(prevState);
      }
    });
  };
  const handleAddCheckedToSelected = () => {
    setSelectedDistances(prevState =>
      sortBy<RouteFromCity>('name')(prevState.concat(Object.values(checkedAvailableRoutes))),
    );
    setCheckedAvailableRoutes({});
  };
  const handleRemoveSelected = () => {
    setSelectedDistances(prevState =>
      prevState.filter(val => !Object.values(checkedSelectedRoutes).includes(val)),
    );
    setCheckedSelectedRoutes({});
  };
  const selectAll = (direction: 'left' | 'right') => {
    if (direction === 'left') {
      const isAllSelected = distances?.length === Object.keys(checkedAvailableRoutes).length;
      setCheckedAvailableRoutes(
        isAllSelected
          ? {}
          : distances?.reduce(
              (previousValue, currentValue) => set(currentValue.id, currentValue)(previousValue),
              {},
            ) || {},
      );
    } else {
      setCheckedSelectedRoutes(
        selectedDistances?.reduce(
          (previousValue, currentValue) => set(currentValue.id, currentValue)(previousValue),
          {},
        ) || {},
      );
    }
  };
  return (
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
              items={filteredDistances}
              selectedItems={checkedAvailableRoutes}
              onSelect={route => handleCheck(route, 'left')}
              onSelectAll={() => selectAll('left')}
            />
          </Grid>
          <Grid
            item
            xs={2}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Grid container direction="column" alignItems="center" style={{ maxHeight: '100%' }}>
              <Button
                variant="outlined"
                size="small"
                onClick={handleAddCheckedToSelected}
                disabled={Object.keys(checkedAvailableRoutes).length === 0}
                aria-label="move selected right"
              >
                &gt;
              </Button>
              <Button
                variant="outlined"
                size="small"
                onClick={handleRemoveSelected}
                disabled={Object.keys(checkedSelectedRoutes).length === 0}
                aria-label="move selected left"
              >
                &lt;
              </Button>
            </Grid>
          </Grid>
          <Grid item xs={5} style={{ maxHeight: '100%' }}>
            <RoutesList
              title={'Selected Routes'}
              items={selectedDistances}
              selectedItems={checkedSelectedRoutes}
              onSelect={route => handleCheck(route, 'right')}
              onSelectAll={() => selectAll('right')}
            />
          </Grid>
        </Grid>
      </DialogContent>
    </Dialog>
  );
};

export default RoutesMultiInput;
