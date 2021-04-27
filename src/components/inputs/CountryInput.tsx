import {
  Checkbox,
  FormControl,
  Input,
  InputLabel,
  ListItemText,
  makeStyles,
  MenuItem,
  Select,
} from '@material-ui/core';
import { get } from 'lodash';
import React from 'react';
import CountryCodes from '../../model/CountryCodes';

const useStyles = makeStyles(theme => ({
  formControl: {
    margin: theme.spacing(1),
    marginLeft: theme.spacing(2),
    marginRight: theme.spacing(2),
    minWidth: 120,
    // maxWidth: 300,
  },
}));
const CountryInput: React.FC<Props> = ({ selectedCountries, onChange, selectableValues }) => {
  const classes = useStyles();

  return (
    <FormControl className={classes.formControl}>
      <InputLabel id="status-select">Country</InputLabel>
      <Select
        labelId="status-select"
        id="status-select-checkbox"
        multiple
        value={selectedCountries}
        onChange={event => onChange(event.target.value as string[])}
        input={<Input />}
        renderValue={selected => (selected as any[]).map(s => get(CountryCodes, s, '-')).join(', ')}
        MenuProps={MenuProps}
      >
        {selectableValues.map(key => (
          <MenuItem key={key} value={key}>
            <Checkbox checked={selectedCountries.includes(key)} />
            <ListItemText primary={get(CountryCodes, key, '-')} />
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
};

export default CountryInput;

interface Props {
  selectedCountries: string[];
  selectableValues: string[];
  onChange: (countries: string[]) => void;
}

const ITEM_HEIGHT = 48;
const ITEM_PADDING_TOP = 8;
const MenuProps = {
  PaperProps: {
    style: {
      maxHeight: ITEM_HEIGHT * 5.5 + ITEM_PADDING_TOP,
      width: 250,
    },
  },
};
