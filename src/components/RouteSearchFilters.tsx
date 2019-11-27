import React, { Fragment, useContext, useEffect, useState } from 'react';
import identity from 'lodash/identity';
import { Theme, makeStyles, List, Typography } from '@material-ui/core';
import Carrier from '../model/Carrier';
import RouteSearchFilter from './RouteSearchFilter';
import Carriers from '../contexts/Carriers';

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
  const carriers = useContext(Carriers);

  const filter = only ? (carrier: Carrier) => only.indexOf(carrier.name) !== -1 : identity;

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
                key={carrier.id}
                label={carrier.name}
                selected={value === carrier?.id}
                onSelect={callback => onChange(carrier.id, callback)}
              />
            ))}
      </List>
    </Fragment>
  );
};

export default RouteSearchFilters;
