import React, { useEffect, useRef, useState } from 'react';
import set from 'lodash/set';
import { Theme, makeStyles, Grid, Button, Paper } from '@material-ui/core';
import Port from '../model/Port';
import PortInput from './inputs/PortInput';
import DateInput from './inputs/DateInput';
import WeeksInput from './inputs/WeeksInput';
import RouteSearchParams from '../model/route-search/RouteSearchParams';

interface Props {
  value: RouteSearchParams;
  onChange: (params: RouteSearchParams) => void;
  onSearch: () => void;
}

const useStyles = makeStyles((theme: Theme) => ({
  button: {
    fontSize: 16,
    paddingTop: 14,
    paddingBottom: 14,
    paddingLeft: 27,
    paddingRight: 27,
  },
}));

const RouteSearchBar: React.FC<Props> = ({ value, onChange, onSearch }) => {
  const classes = useStyles();
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
    const controller = new AbortController();
    const signal = controller.signal;

    (async () => {
      const response = await fetch('http://localhost:8080/ports', { signal });
      const body = await response.json();
      setPorts(body.Ports as Port[]);
    })();

    return () => {
      controller.abort();
    };
  }, []);

  const handleOriginPortChange = (port: Port) => {
    setOriginPort(port);
    destinationInput.current!.focus();
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
      originInput.current!.focus();
    } else if (!destinationPort) {
      destinationInput.current!.focus();
    } else if (!date) {
      setDateOpen(true);
    } else if (!weeks) {
      setWeeksOpen(true);
    } else {
      onSearch();
    }
  };

  return (
    <Paper>
      <Grid container justify="center" spacing={2}>
        <Grid item sm={3}>
          <PortInput
            label="Origin Port"
            ports={ports}
            inputRef={originInput}
            value={originPort}
            onChange={handleOriginPortChange}
            open={originPortOpen}
            onOpen={() => setOriginPortOpen(true)}
            onClose={() => setOriginPortOpen(false)}
          />
        </Grid>
        <Grid item sm={3}>
          <PortInput
            label="Destination Port"
            ports={ports}
            inputRef={destinationInput}
            value={destinationPort}
            onChange={handleDestinationPortChange}
            open={destinationPortOpen}
            onOpen={() => setDestinationPortOpen(true)}
            onClose={() => setDestinationPortOpen(false)}
          />
        </Grid>
        <Grid item>
          <DateInput
            value={date}
            onChange={handleDateChange}
            open={dateOpen}
            onOpen={() => setDateOpen(true)}
            onClose={() => setDateOpen(false)}
          />
        </Grid>
        <Grid item>
          <WeeksInput
            value={weeks}
            onChange={handleWeeksChange}
            open={weeksOpen}
            onOpen={() => setWeeksOpen(true)}
            onClose={() => setWeeksOpen(false)}
          />
        </Grid>
        <Grid item>
          <Button
            buttonRef={searchButton}
            variant="contained"
            color="primary"
            className={classes.button}
            onClick={handleSearch}
          >
            Search
          </Button>
        </Grid>
      </Grid>
    </Paper>
  );
};

export default RouteSearchBar;
