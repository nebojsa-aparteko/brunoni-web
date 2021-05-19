import { FormControl, InputLabel, makeStyles, MenuItem, Select, Typography } from '@material-ui/core';
import React from 'react';
import PickupLocation from '../../model/PickupLocation';

const useStyles = makeStyles(theme => ({
  formControl: {
    margin: theme.spacing(1),
    marginLeft: theme.spacing(2),
    marginRight: theme.spacing(2),
    minWidth: 120,
  },
  menuItem: {
    maxWidth: '40em',
    overflow: 'hidden',
    whiteSpace: 'nowrap',
    textOverflow: 'ellipsis',
  },
  menuItemPrimaryText: {
    fontWeight: 500,
  },
  menuItemSecondaryText: {
    textOverflow: 'ellipsis',
    overflow: 'hidden',
    marginLeft: theme.spacing(1),
  },
}));
const PickupLocationInput: React.FC<Props> = ({ selectedLocation, onChange, selectableValues }) => {
  const classes = useStyles();

  return (
    <FormControl className={classes.formControl}>
      <InputLabel id="status-select">Location</InputLabel>
      <Select
        value={selectedLocation || ''}
        onChange={event => onChange(event.target.value as string)}
        // style={{ flex: 1, height: 'fit-content' }}
        className={classes.menuItem}
        // label="Location"
        // placeholder="Location"
      >
        <MenuItem value="">
          <em>None</em>
        </MenuItem>
        {selectableValues?.map(location => (
          <MenuItem key={location.id} value={location.id}>
            <Typography className={classes.menuItemPrimaryText}>{location.name}</Typography>
            <Typography
              className={classes.menuItemSecondaryText}
              variant="body2"
              color="textSecondary"
              title={location.city}
            >
              {location.city}
            </Typography>
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
};

export default PickupLocationInput;

interface Props {
  selectedLocation?: string;
  selectableValues?: PickupLocation[];
  onChange: (locations: string) => void;
}
