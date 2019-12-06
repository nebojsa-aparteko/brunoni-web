import React, { Fragment, useContext, useEffect, useRef, useState } from 'react';
import Mousetrap from 'mousetrap';
import get from 'lodash/fp/get';
import set from 'lodash/fp/set';
import {
  Theme,
  makeStyles,
  Grid,
  Button,
  CircularProgress,
  Typography,
  Box,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Paper,
} from '@material-ui/core';
import Port from '../model/Port';
import includes from 'lodash/fp/includes';
import PortInput from './inputs/PortInput';
import DateInput from './inputs/DateInput';
import WeeksInput from './inputs/WeeksInput';
import ContainerModel from '../model/Container';
import ListInput from './inputs/ListInput';
import ContainerInput from './inputs/ContainerInput';
import Container from './Container';
import ContainerType from '../model/Container';
import Ports from '../contexts/Ports';
import useUser from '../hooks/useUser';
import { useHistory } from 'react-router';
import { RouteSearchContext } from '../contexts/RouteSearchContext';
import { useSnackbar } from 'notistack';
import { buildMailToLink } from '../utilities/quoteRequestEmail';
import Meta from '../components/Meta';
import { europeanCountries } from '../utilities/pickupDropOffHelperData';

interface Props {}

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    flex: 4,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    paddingTop: theme.spacing(4),
    paddingBottom: theme.spacing(4),
  },
  button: {
    position: 'relative',
  },
  progress: {
    position: 'absolute',
  },
  paper: {
    padding: theme.spacing(2),
  },
}));

const focusAndSelect = (input: HTMLInputElement) => {
  input.focus();
  input.setSelectionRange(0, input.value.length);
};

const checkIfPortsInEurope = (originPort: Port | undefined, destinationPort: Port | undefined) => {
  return (
    includes(originPort?.country.toLowerCase())(europeanCountries) ||
    includes(destinationPort?.country.toLowerCase())(europeanCountries)
  );
};

const GetQuotes: React.FC<Props> = () => {
  const classes = useStyles();
  const [user] = useUser();
  const history = useHistory();

  const { enqueueSnackbar } = useSnackbar();

  const [value, onChange] = useContext(RouteSearchContext);
  const [busy, setBusy] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [showContainerLocations, setShowContainerLocations] = useState(false);
  const ports = useContext(Ports);
  const [originPortOpen, setOriginPortOpen] = useState<boolean>(false);
  const [destinationPortOpen, setDestinationPortOpen] = useState<boolean>(false);
  const [dateOpen, setDateOpen] = useState<boolean>(false);
  const [weeksOpen, setWeeksOpen] = useState<boolean>(false);
  const originInput = useRef<HTMLInputElement>();
  const destinationInput = useRef<HTMLInputElement>();
  const listInput = useRef<unknown>();
  const addButton = useRef<HTMLButtonElement>();

  const { originPort, destinationPort, date, weeks, containers } = value;

  const setOriginPort = (port: Port) => onChange(set('originPort', port)(value));
  const setDestinationPort = (port: Port) => onChange(set('destinationPort', port)(value));
  const setDate = (date: Date) => onChange(set('date', date)(value));
  const setWeeks = (weeks: number) => onChange(set('weeks', weeks)(value));
  const setContainers = (containers: ContainerModel[]) => onChange(set('containers', containers)(value));

  const closeDialog = () => setDialogOpen(false);

  useEffect(() => {
    setShowContainerLocations(checkIfPortsInEurope(originPort, destinationPort));
  }, [originInput, destinationInput, originPort, destinationPort]);

  useEffect(() => {
    const focusSearch = () =>
      setTimeout(() => {
        focusAndSelect(originInput.current!);
      });

    Mousetrap.bind('g s', focusSearch);

    return () => {
      Mousetrap.unbind('g s');
    };
  }, [originInput]);

  useEffect(() => {
    if (!busy || !user) {
      return;
    }

    const hasOversizeCargo = containers.some(container => container.oog[0]);
    const hasHazardousCargo = containers.some(container => container.imo[0]);

    if (hasOversizeCargo || hasHazardousCargo) {
      setDialogOpen(true);
      setBusy(false);
      return;
    }

    const controller = new AbortController();
    const signal = controller.signal;

    (async () => {
      try {
        const token = await user.getIdToken();

        const response = await fetch(`${process.env.REACT_APP_API_URL}/quotes/create`, {
          method: 'POST',
          mode: 'cors',
          cache: 'no-cache',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            origin: originPort!.id,
            destination: destinationPort!.id,
            date: date.toISOString(),
            weeks: Number(weeks),
            containers: containers.map((container: ContainerType) => ({
              type: container.containerType!.id,
              commodity: container.commodityType!.id,
              location: container.location?.id,
              quantity: container.quantity,
            })),
          }),
          signal,
        });

        console.log('get quote response', response);
        if (response.status === 504) {
          enqueueSnackbar(<Typography>The API timed out trying to fetch quotes. Please try again.</Typography>, {
            variant: 'error',
          });
          console.error('API error', response.status, response.statusText);
        } else if (response.status === 500) {
          enqueueSnackbar(<Typography>The could not answer your request at the moment. Please try again.</Typography>, {
            variant: 'error',
          });
          console.error('API error', response.status, response.statusText);
        } else if (response.status === 200 || response.status === 201) {
          const json = await response.json();
          const groupId = get('groupId')(json);

          if (groupId) {
            history.push(`/quotes/groups/${groupId}`);
          } else {
            setDialogOpen(true);
          }
        } else {
          enqueueSnackbar(
            <Typography>Whoops our system is experiencing difficulties at the moment. Please try again.</Typography>,
            {
              variant: 'error',
            },
          );
          console.error('Unexpected error response', response.status, response.statusText);
        }
      } catch (error) {
        enqueueSnackbar(<Typography>The API timed out trying to fetch quotes. Please try again.</Typography>, {
          variant: 'error',
        });
        console.error(error);
      } finally {
        setBusy(false);
      }
    })();

    return () => {
      controller.abort();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, busy]);

  const handleOriginPortChange = (port: Port) => {
    setOriginPort(port);
    focusAndSelect(destinationInput.current!);
  };

  const handleDestinationPortChange = (port: Port) => {
    setDestinationPort(port);
    addButton.current!.focus();
    if (!date) {
      setDateOpen(true);
    } else if (!weeks) {
      setWeeksOpen(true);
    }
  };

  const handleDateChange = (date: Date) => {
    setDate(date);
    setDateOpen(false);
    addButton.current!.focus();
    if (!weeks) {
      setWeeksOpen(true);
    }
  };

  const handleWeeksChange = (weeks: number) => {
    setWeeks(weeks);
    setTimeout(() => addButton.current!.focus());
  };

  const handleSearch = () => {
    if (!originPort) {
      focusAndSelect(originInput.current!);
    } else if (!destinationPort) {
      focusAndSelect(destinationInput.current!);
    } else if (!date) {
      setDateOpen(true);
    } else if (!weeks) {
      setWeeksOpen(true);
    } else if (containers.length === 0) {
      addButton.current!.focus();
    } else {
      for (let i = 0, n = containers.length; i < n; i++) {
        const container = containers[i];
        if (!container.containerType || !container.commodityType) {
          (listInput.current! as { focus: (i: number) => void }).focus(i);
          return;
        } else if (
          !container.location &&
          !((container.containerType?.description || '').endsWith('S.O.') || !showContainerLocations)
        ) {
          (listInput.current! as { focus: (i: number) => void }).focus(i);
          return;
        }
      }
      setBusy(true);
    }
  };

  const sendEmail = () => {
    window.open(buildMailToLink(value));
    closeDialog();
  };

  return (
    <Fragment>
      <Meta title="Get Quote" />
      <Container className={classes.root}>
        <Paper>
          <Box p={2}>
            <Box mb={2}>
              <Typography variant="h4" gutterBottom>
                Get Quote
              </Typography>
            </Box>
            <Grid container spacing={2}>
              <Grid item sm={4} xs={12}>
                <PortInput
                  label="Origin"
                  ports={ports}
                  inputRef={originInput}
                  value={originPort}
                  onChange={handleOriginPortChange}
                  open={originPortOpen}
                  onOpen={() => setOriginPortOpen(true)}
                  onClose={() => setOriginPortOpen(false)}
                />
              </Grid>
              <Grid item sm={4} xs={12}>
                <PortInput
                  label="Destination"
                  ports={ports}
                  inputRef={destinationInput}
                  value={destinationPort}
                  onChange={handleDestinationPortChange}
                  open={destinationPortOpen}
                  onOpen={() => setDestinationPortOpen(true)}
                  onClose={() => setDestinationPortOpen(false)}
                />
              </Grid>
              <Grid item sm={2} xs={6}>
                <DateInput
                  value={date}
                  onChange={handleDateChange}
                  open={dateOpen}
                  onOpen={() => setDateOpen(true)}
                  onClose={closeDialog}
                />
              </Grid>
              <Grid item sm={2} xs={6}>
                <WeeksInput
                  value={weeks}
                  onChange={handleWeeksChange}
                  open={weeksOpen}
                  onOpen={() => setWeeksOpen(true)}
                  onClose={() => setWeeksOpen(false)}
                />
              </Grid>
              <Grid item xs={12}>
                <Typography variant="h5" gutterBottom>
                  Containers
                </Typography>
                <ListInput
                  listRef={listInput}
                  addButtonRef={addButton}
                  ItemInput={ContainerInput}
                  ItemInputProps={{ showLocations: showContainerLocations }}
                  addText="Add Cargo"
                  defaultItemValue={{ quantity: 1, imo: [false], oog: [false] }}
                  value={containers}
                  onChange={setContainers}
                />
              </Grid>
              <Grid item sm="auto" xs={12}>
                <Button
                  variant="contained"
                  size="large"
                  color="primary"
                  className={classes.button}
                  onClick={handleSearch}
                  fullWidth
                >
                  <CircularProgress
                    size={20}
                    color="inherit"
                    className={classes.progress}
                    style={{ visibility: busy ? 'visible' : 'hidden' }}
                  />
                  <span style={{ visibility: busy ? 'hidden' : 'visible' }}>Request</span>
                </Button>
              </Grid>
            </Grid>
          </Box>
        </Paper>
        {process.env.NODE_ENV !== 'production' && (
          <Box mt={4}>
            <Typography variant="subtitle2">This is visible in development only.</Typography>
            <Typography variant="h5">For testing purposes please use following options:</Typography>
            <Box display="flex" flexDirection="column" my={1}>
              <Box my={1}>
                <Typography variant="h6">Hamburg Süd</Typography>
                <Box display="flex" mx={-1}>
                  <Box mx={1}>
                    <Typography>Rotterdam to Santos</Typography>
                    <Typography>20‘Boxcontainer & 40‘Boxcontainer & 40‘High Cube Container</Typography>
                  </Box>
                  <Box mx={1}>
                    <Typography>Rotterdam to Santos</Typography>
                    <Typography>20‘Reefer & 40‘& 40‘High Cube Reefer Container</Typography>
                  </Box>
                </Box>
              </Box>
              <Box my={1}>
                <Typography variant="h6">Hyundai</Typography>
                <Box display="flex" mx={-1}>
                  <Box mx={1}>
                    <Typography>Rotterdam to Shanghai</Typography>
                    <Typography>20‘Boxcontainer & 40‘Boxcontainer & 40‘High Cube Container</Typography>
                  </Box>
                  <Box mx={1}>
                    <Typography>Rotterdam to Shanghai</Typography>
                    <Typography>20‘Reefer & 40‘& 40‘High Cube Reefer Container</Typography>
                  </Box>
                </Box>
              </Box>
            </Box>
          </Box>
        )}
      </Container>
      <Dialog
        open={dialogOpen}
        keepMounted
        onClose={closeDialog}
        aria-labelledby="alert-dialog-slide-title"
        aria-describedby="alert-dialog-slide-description"
      >
        <DialogTitle id="alert-dialog-slide-title">Special Quote Request</DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-slide-description">
            This quote is available via email only. Press Send Email to proceed.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeDialog} color="primary">
            Cancel
          </Button>
          <Button onClick={sendEmail} variant="contained" color="primary">
            Send Email
          </Button>
        </DialogActions>
      </Dialog>
    </Fragment>
  );
};

export default GetQuotes;
