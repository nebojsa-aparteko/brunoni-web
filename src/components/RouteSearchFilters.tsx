import React, { Fragment, useEffect, useState } from 'react';
import identity from 'lodash/identity';
import { Theme, makeStyles, List, Typography } from '@material-ui/core';
import Carrier from '../model/Carrier';
import RouteSearchFilter from './RouteSearchFilter';

interface Props {
  only?: string[];
  value?: string;
  onChange: (carrier: string | undefined, callback: () => void) => void;
}

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    fontWeight: 'bold',
  },
  padded: {
    paddingLeft: theme.spacing(2),
    paddingRight: theme.spacing(2),
  },
}));

const RouteSearchFilters: React.FC<Props> = ({ only, value, onChange }) => {
  const classes = useStyles();
  const [carriers, setCarriers] = useState<Carrier[]>([]);

  useEffect(() => {
    const controller = new AbortController();
    const signal = controller.signal;

    (async () => {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/carriers`, { signal });
      const body = await response.json();
      setCarriers(body.Carriers as Carrier[]);
    })();

    return () => {
      controller.abort();
    };
  }, []);

  const filter = only ? (carrier: Carrier) => only.indexOf(carrier.CarrierName) !== -1 : identity;

  return (
    <Fragment>
      <Typography variant="subtitle2" className={classes.padded}>
        Carrier
      </Typography>
      <List dense className={classes.root}>
        <RouteSearchFilter
          label="ANY"
          selected={value === undefined}
          onSelect={callback => onChange(undefined, callback)}
        />
        {carriers &&
          carriers
            .filter(filter)
            .map(carrier => (
              <RouteSearchFilter
                key={carrier.ID}
                label={carrier.CarrierName}
                selected={value === (carrier || {}).ID}
                onSelect={callback => onChange(carrier.ID, callback)}
              />
            ))}
      </List>
    </Fragment>
  );
};

export default RouteSearchFilters;
