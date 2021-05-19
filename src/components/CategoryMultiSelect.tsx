import React from 'react';
import {
  Checkbox,
  createStyles,
  FormControl,
  FormControlLabel,
  FormGroup,
  // FormHelperText,
  // FormLabel,
  makeStyles,
  Theme,
} from '@material-ui/core';
import { ImpExp } from '../model/PaymentConfirmationRule';

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
          control={<Checkbox checked={value.import} onChange={onChange} name="import" />}
          label="Import/Crosstrade"
        />
        <FormControlLabel
          control={<Checkbox checked={value.export} onChange={onChange} name="export" />}
          label="Export"
        />
      </FormGroup>
    </FormControl>
  );
};

export default CategoryMultiSelect;

interface Props {
  value: ImpExp;
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
}
