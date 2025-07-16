import React from 'react';
import { TextField, makeStyles, Theme } from '@material-ui/core';

interface Props {
  label: string;
  value: string[];
  onChange: (groups: string[] | null) => void;
  margin?: any;
}

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    width: '100%',
  },
}));

const OpportunityQuoteKindInput: React.FC<Props> = ({ label, value, onChange, margin }) => {
  const classes = useStyles();

  const inputValue = (value ?? []).join(', ');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const vals = e.target.value
      .split(',')
      .map(v => v.trim())
      .filter(Boolean);
    onChange(vals.length ? vals : null);
  };

  return (
    <TextField
      className={classes.root}
      label={label}
      value={inputValue}
      onChange={handleChange}
      fullWidth
      variant="outlined"
      margin={margin}
      placeholder="Enter quote kinds, separated by commas"
    />
  );
};

export default OpportunityQuoteKindInput;
