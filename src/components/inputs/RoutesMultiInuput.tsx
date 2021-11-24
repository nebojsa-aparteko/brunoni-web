import React, { Dispatch, SetStateAction, useEffect, useState } from 'react';
import City from '../../model/City';
import {
  Box,
  Button,
  Card,
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
  Typography,
} from '@material-ui/core';
import CloseIcon from '@material-ui/icons/Close';
import RouteFromCity from '../../model/RouteFromCity';
import firebase from '../../firebase';
import ChartsCircularProgress from '../dashboard/ChartsCircularProgress';
import useGlobalAppState from '../../hooks/useGlobalAppState';
import sortBy from 'lodash/sortBy';

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
    maxHeight: '80vh',
  },
}));

interface RoutesListProps {
  title: string;
  items?: RouteFromCity[];
  selectedItems: RouteFromCity[];
  onSelect: (route: RouteFromCity) => void;
  setSelected: Dispatch<SetStateAction<RouteFromCity[]>>;
}

const RoutesList: React.FC<RoutesListProps> = ({ title, items, selectedItems, onSelect, setSelected }) => {
  const handleToggleAll = () => {
    setSelected(prevState => (prevState.length === items?.length ? [] : items || []));
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
        subheader={`${selectedItems.length}/${items?.length} selected`}
      />
      <Divider />
      {items ? (
        <List
          style={{
            // width: 200,
            maxHeight: '100%',
            backgroundColor: 'background.paper',
            overflow: 'scroll',
          }}
          dense
          component="div"
          role="list"
        >
          {items.map(value => {
            const labelId = `transfer-list-all-item-${value}-label`;

            return (
              <ListItem key={value.id} role="listitem" button onClick={() => onSelect(value)}>
                <ListItemIcon>
                  <Checkbox
                    checked={selectedItems.some(route => route.id === value.id)}
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
    </Card>
  );
};

interface Props {
  startingCity?: City;
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
          id: v.id,
        } as RouteFromCity),
    );
  } catch (error) {
    console.error('useFirestoreCollection threw an error', error);
    return null;
  }
};

const RoutesMultiInput: React.FC<Props> = ({ startingCity, selectedRoutes, setSelectedRoutes }) => {
  const classes = useStyles();
  const [, dispatch] = useGlobalAppState();
  const [routesState, setRoutesState] = useState<RouteFromCity[] | undefined>(undefined);
  const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false);
  const [checkedAvailableRoutes, setCheckedAvailableRoutes] = useState<RouteFromCity[]>([]);
  const [checkedSelectedRoutes, setCheckedSelectedRoutes] = useState<RouteFromCity[]>([]);
  const [selectedCountries, setSelectedCountries] = useState<string[]>([]);

  useEffect(() => {
    setSelectedCountries(
      selectedRoutes.map(route => route.countryCode).filter((value, index, self) => self.indexOf(value) === index),
    );
  }, [selectedRoutes]);

  const handleOpenDialog = async () => {
    dispatch({ type: 'START_GLOBAL_LOADING' });
    setRoutesState(
      (await handleFetchData(startingCity?.countryCode, startingCity?.id))?.filter(
        route => !selectedRoutes.some((r: RouteFromCity) => r.id === route.id),
      ) || undefined,
    );
    dispatch({ type: 'STOP_GLOBAL_LOADING' });
    setIsDialogOpen(true);
  };

  const closeDialog = () => setIsDialogOpen(false);

  const handleCheckedRight = () => {
    setSelectedRoutes(prevState => sortBy(prevState.concat(checkedAvailableRoutes), ['name']));
    setRoutesState(prevState =>
      prevState?.filter(route => !checkedAvailableRoutes.some((r: RouteFromCity) => r.id === route.id)),
    );
    setCheckedAvailableRoutes([]);
  };

  const handleCheckedLeft = () => {
    setRoutesState(prevState => sortBy((prevState || []).concat(checkedSelectedRoutes), ['name']));
    setSelectedRoutes(prevState =>
      prevState?.filter(route => !checkedSelectedRoutes.some((r: RouteFromCity) => r.id === route.id)),
    );
    setCheckedSelectedRoutes([]);
  };

  const handleSelectLeft = (value: RouteFromCity) => {
    setCheckedAvailableRoutes(prevState =>
      prevState.includes(value) ? prevState.filter(a => a.id !== value.id) : prevState.concat(value),
    );
  };
  const handleSelectRight = (value: RouteFromCity) => {
    setCheckedSelectedRoutes(prevState =>
      prevState.includes(value) ? prevState.filter(a => a.id !== value.id) : prevState.concat(value),
    );
  };

  return (
    <Box display="flex" flexDirection="row">
      <Button
        variant="outlined"
        onClick={handleOpenDialog}
        disabled={!startingCity}
        style={{ height: 38, marginTop: 4 }}
      >
        {selectedRoutes?.length > 0
          ? `${selectedRoutes.length} cities in ${selectedCountries.join(', ')}`
          : 'Select Routes'}
      </Button>
      {isDialogOpen && (
        <Dialog
          open={isDialogOpen}
          keepMounted
          onClose={closeDialog}
          maxWidth="md"
          fullWidth
          aria-labelledby="alert-dialog-slide-title"
          aria-describedby="alert-dialog-slide-description"
        >
          <DialogTitle disableTypography>
            <Typography variant="h4">{'Select the desired routes'}</Typography>
            <IconButton onClick={closeDialog} className={classes.closeModal}>
              <CloseIcon />
            </IconButton>
          </DialogTitle>
          <DialogContent className={classes.dialogContent}>
            <Grid container spacing={2} style={{ display: 'flex', flex: 1, maxHeight: '100%' }}>
              <Grid item xs={5} style={{ maxHeight: '100%' }}>
                <RoutesList
                  title={'Available Routes'}
                  items={routesState || []}
                  selectedItems={checkedAvailableRoutes}
                  onSelect={handleSelectLeft}
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
                    onClick={handleCheckedRight}
                    disabled={checkedAvailableRoutes.length === 0}
                    aria-label="move selected right"
                  >
                    &gt;
                  </Button>
                  <Button
                    variant="outlined"
                    size="small"
                    onClick={() => handleCheckedLeft()}
                    disabled={selectedRoutes.length === 0}
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
