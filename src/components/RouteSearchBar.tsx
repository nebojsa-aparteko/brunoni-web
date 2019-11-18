import React, { useEffect, useRef, useState } from 'react';
import Mousetrap from 'mousetrap';
import set from 'lodash/set';
import { Theme, makeStyles, Grid, Button, Paper, CircularProgress } from '@material-ui/core';
import Port from '../model/Port';
import PortInput from './inputs/PortInput';
import DateInput from './inputs/DateInput';
import WeeksInput from './inputs/WeeksInput';
import RouteSearchParams from '../model/route-search/RouteSearchParams';

interface Props {
  value: RouteSearchParams;
  onChange: (params: RouteSearchParams) => void;
  onSearch: (callback: () => void) => void;
  paperVisibility: any;
}

const useStyles = makeStyles((theme: Theme) => ({
  paperRoot: {
    padding: theme.spacing(1),
    [theme.breakpoints.down('sm')]: {
      padding: theme.spacing(2),
    },
  },
  button: {
    fontSize: 16,
    paddingTop: 13,
    paddingBottom: 13,
    paddingLeft: 27,
    paddingRight: 27,
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

const RouteSearchBar: React.FC<Props> = ({ value, onChange, onSearch, paperVisibility }) => {
  const classes = useStyles();
  const [busy, setBusy] = useState(false);
  const [ports, setPorts] = useState<Port[]>();
  const [originPortOpen, setOriginPortOpen] = useState<boolean>(false);
  const [destinationPortOpen, setDestinationPortOpen] = useState<boolean>(false);
  const [dateOpen, setDateOpen] = useState<boolean>(false);
  const [weeksOpen, setWeeksOpen] = useState<boolean>(false);
  const originInput = useRef<HTMLInputElement>();
  const destinationInput = useRef<HTMLInputElement>();
  const searchButton = useRef<HTMLButtonElement>();

  const { originPort, destinationPort, date, weeks } = value;
  const setOriginPort = (port: Port) => onChange(set(value, 'originPort', port));
  const setDestinationPort = (port: Port) => onChange(set(value, 'destinationPort', port));
  const setDate = (date: Date) => onChange(set(value, 'date', date));
  const setWeeks = (weeks: number) => onChange(set(value, 'weeks', weeks));

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
      onSearch(() => setBusy(false));
    }
  };

  return (
    <Paper className={`${paperVisibility} ${classes.paperRoot}`}>
      <Grid container justify="center" spacing={2}>
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
        <Grid item sm="auto" xs={12}>
          <Button
            buttonRef={searchButton}
            variant="contained"
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
            <span style={{ visibility: busy ? 'hidden' : 'visible' }}>Search</span>
          </Button>
        </Grid>
      </Grid>
    </Paper>
  );
};

export default RouteSearchBar;
