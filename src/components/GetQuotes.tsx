import React, { useEffect, useRef, useState } from 'react';
import Mousetrap from 'mousetrap';
import set from 'lodash/fp/set';
import { Theme, makeStyles, Grid, Button, CircularProgress, Typography } from '@material-ui/core';
import Port from '../model/Port';
import PortInput from './inputs/PortInput';
import DateInput from './inputs/DateInput';
import WeeksInput from './inputs/WeeksInput';
import GetQuotesParams from '../model/get-quotes/GetQuotesParams';
import { Container as ContainerModel } from '../model/get-quotes/Container';
import ListInput from './inputs/ListInput';
import ContainerInput from './inputs/ContainerInput';
import ContainerTypesProvider from './ContainerTypesProvider';
import Container from './Container';
import CommodityTypesProvider from './CommodityTypesProvider';

interface Props {}

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    flex: 4,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    paddingTop: theme.spacing(2),
    paddingBottom: theme.spacing(2),
  },
  button: {
    position: 'relative',
  },
  progress: {
    position: 'absolute',
  },
}));

const focusAndSelect = (input: HTMLInputElement) => {
  input.focus();
  input.setSelectionRange(0, input.value.length);
};

const GetQuotes: React.FC<Props> = () => {
  const classes = useStyles();
  const [value, onChange] = useState<GetQuotesParams>({ date: new Date(), weeks: 4, containers: [] });
  const [busy, setBusy] = useState(false);
  const [ports, setPorts] = useState<Port[]>();
  const [originPortOpen, setOriginPortOpen] = useState<boolean>(false);
  const [destinationPortOpen, setDestinationPortOpen] = useState<boolean>(false);
  const [dateOpen, setDateOpen] = useState<boolean>(false);
  const [weeksOpen, setWeeksOpen] = useState<boolean>(false);
  const originInput = useRef<HTMLInputElement>();
  const destinationInput = useRef<HTMLInputElement>();
  const searchButton = useRef<HTMLButtonElement>();

  const { originPort, destinationPort, date, weeks, containers } = value;
  const setOriginPort = (port: Port) => onChange(set('originPort', port)(value));
  const setDestinationPort = (port: Port) => onChange(set('destinationPort', port)(value));
  const setDate = (date: Date) => onChange(set('date', date)(value));
  const setWeeks = (weeks: number) => onChange(set('weeks', weeks)(value));
  const setContainers = (containers: ContainerModel[]) => onChange(set('containers', containers)(value));

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
    const controller = new AbortController();
    const signal = controller.signal;

    (async () => {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/ports`, { signal });
      const body = await response.json();
      setPorts(body.Ports as Port[]);
    })();

    return () => {
      controller.abort();
    };
  }, []);

  const handleOriginPortChange = (port: Port) => {
    setOriginPort(port);
    focusAndSelect(destinationInput.current!);
  };

  const handleDestinationPortChange = (port: Port) => {
    setDestinationPort(port);
    searchButton.current!.focus();
    if (!date) {
      setDateOpen(true);
    } else if (!weeks) {
      setWeeksOpen(true);
    }
  };

  const handleDateChange = (date: Date) => {
    setDate(date);
    setDateOpen(false);
    searchButton.current!.focus();
    if (!weeks) {
      setWeeksOpen(true);
    }
  };

  const handleWeeksChange = (weeks: number) => {
    setWeeks(weeks);
    setTimeout(() => searchButton.current!.focus());
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
    } else {
      setBusy(true);
      // TODO
      alert('search');
      // onSearch(() => setBusy(false));
    }
  };

  return (
    <Container className={classes.root}>
      <Typography variant="h5" gutterBottom>
        Request Quotes
      </Typography>
      <Grid container spacing={2}>
        <Grid item sm={3} xs={12}>
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
        <Grid item sm={3} xs={12}>
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
        <Grid item sm="auto" xs={6}>
          <DateInput
            value={date}
            onChange={handleDateChange}
            open={dateOpen}
            onOpen={() => setDateOpen(true)}
            onClose={() => setDateOpen(false)}
          />
        </Grid>
        <Grid item sm="auto" xs={6}>
          <WeeksInput
            value={weeks}
            onChange={handleWeeksChange}
            open={weeksOpen}
            onOpen={() => setWeeksOpen(true)}
            onClose={() => setWeeksOpen(false)}
          />
        </Grid>
        <Grid item xs={12}>
          <Typography variant="h6" gutterBottom>
            Containers
          </Typography>
          <ContainerTypesProvider>
            <CommodityTypesProvider>
              <ListInput
                ItemInput={ContainerInput}
                defaultItemValue={{ quantity: 1 }}
                value={containers}
                onChange={setContainers}
              />
            </CommodityTypesProvider>
          </ContainerTypesProvider>
        </Grid>
        <Grid item sm="auto" xs={12}>
          <Button
            buttonRef={searchButton}
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
    </Container>
  );
};

export default GetQuotes;
