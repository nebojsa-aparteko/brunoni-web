import React from 'react';
import { makeStyles, TextField } from '@material-ui/core';
import { Autocomplete } from '@material-ui/lab';

const useStyles = makeStyles({
  customTextField: {
    '& .MuiAutocomplete-input': {
      width: '150px',
    },
    '& input::placeholder': {
      fontSize: '15px',
    },
  },
});

interface CommoditiesMultiInputProps {
  data?: string[];
  label?: string;
  selectedCommodities?: string[];
  onChange?: (commodities: string[]) => void;
  placeholder?: string;
}

const CommoditiesMultiInput: React.FC<CommoditiesMultiInputProps> = ({
  data = [],
  label = 'Commodities',
  selectedCommodities = [],
  onChange,
  placeholder = 'Add commodity ↵',
}) => {
  const classes = useStyles();

  return (
    <Autocomplete
      classes={{ root: classes.customTextField }}
      multiple
      freeSolo
      options={data}
      value={selectedCommodities}
      onChange={(_, newValue) => {
        onChange?.(newValue);
      }}
      renderInput={params => (
        <TextField {...params} label={label} placeholder={placeholder} variant="outlined" />
      )}
    />
  );
};

export default CommoditiesMultiInput;
