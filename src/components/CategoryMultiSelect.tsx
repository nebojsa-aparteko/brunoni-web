import React from 'react';
import {
  Checkbox,
  createStyles,
  FormControl,
  FormControlLabel,
  FormGroup,
  makeStyles,
  Theme,
} from '@material-ui/core';
import { BookingCategory } from '../model/Booking';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      display: 'flex',
    },
    formControl: {
      margin: theme.spacing(2),
    },
  }),
);

const CategoryMultiSelect: React.FC<Props> = ({ value, onChange }) => {
  const classes = useStyles();

  return (
    <FormControl component="fieldset" className={classes.formControl} style={{ marginTop: 0 }}>
      <FormGroup>
        <FormControlLabel
          control={
            <Checkbox
              checked={value.includes(BookingCategory.Import)}
              onChange={onChange}
              name={BookingCategory.Import}
            />
          }
          label="Import/Crosstrade"
        />
        <FormControlLabel
          control={
            <Checkbox
              checked={value.includes(BookingCategory.Export)}
              onChange={onChange}
              name={BookingCategory.Export}
            />
          }
          label="Export"
        />
      </FormGroup>
    </FormControl>
  );
};

export default CategoryMultiSelect;

interface Props {
  value: BookingCategory[];
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
}
