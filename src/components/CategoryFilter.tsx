import React from 'react';
import { FormControlLabel, makeStyles, Radio, RadioGroup, Theme } from '@material-ui/core';

const useStyles = makeStyles((theme: Theme) => ({
  importOrExport: {
    flexDirection: 'row',
    marginLeft: theme.spacing(4),
  },
}));

const CategoryFilter: React.FC<Props> = ({ value, onChange }) => {
  const classes = useStyles();

  return (
    <RadioGroup
      aria-label="importexport"
      name="importexport"
      value={value}
      onChange={onChange}
      className={classes.importOrExport}
    >
      <FormControlLabel value="Export" control={<Radio />} label="Export" />
      <FormControlLabel value="Import" control={<Radio />} label="Import/Crosstrade" />
    </RadioGroup>
  );
};

export default CategoryFilter;

interface Props {
  value: string;
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
}
