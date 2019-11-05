import React, { useEffect, useState } from 'react';
import { Theme, makeStyles, List, ListItem, ListItemIcon, Checkbox, ListItemText } from '@material-ui/core';
import Carrier from '../model/Carrier';

interface Props {}

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    fontWeight: 'bold',
  },
}));

const RouteSearchFilters: React.FC<Props> = ({}) => {
  const classes = useStyles();
  const [carriers, setCarriers] = useState<Carrier[]>();

  useEffect(() => {
    const controller = new AbortController();
    const signal = controller.signal;

    (async () => {
      const response = await fetch('http://localhost:8080/carriers', { signal });
      const body = await response.json();
      setCarriers(body.Carriers as Carrier[]);
    })();

    return () => {
      controller.abort();
    };
  }, []);

  return (
    <List className={classes.root}>
      {carriers &&
        carriers.map(carrier => {
          const labelId = `checkbox-list-label-${carrier.ID}`;

          return (
            <ListItem key={carrier.ID} role={undefined} dense button onClick={() => {}}>
              <ListItemIcon>
                <Checkbox
                  edge="start"
                  checked={false}
                  tabIndex={-1}
                  disableRipple
                  inputProps={{ 'aria-labelledby': labelId }}
                />
              </ListItemIcon>
              <ListItemText id={labelId} primary={carrier.CarrierName} />
            </ListItem>
          );
        })}
    </List>
  );
};

export default RouteSearchFilters;
