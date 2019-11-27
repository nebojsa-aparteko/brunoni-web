import React, { Fragment, useContext, useMemo } from 'react';
import { Theme, makeStyles, List, Typography } from '@material-ui/core';
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

  const filtered = useMemo(() => {
    if (only) {
      const allowed = only.map(i => i.toLowerCase());
      return (carriers || []).filter(carrier => allowed.indexOf(carrier.name.toLowerCase()) !== -1);
    } else {
      return carriers || [];
    }
  }, [only, carriers]);

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
        {filtered.map(carrier => (
          <RouteSearchFilter
            key={carrier.id}
            label={carrier.name.toUpperCase()}
            selected={value === carrier?.id}
            onSelect={callback => onChange(carrier.id, callback)}
          />
        ))}
      </List>
    </Fragment>
  );
};

export default RouteSearchFilters;
