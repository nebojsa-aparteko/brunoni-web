import React from 'react';
import Autocomplete from '@material-ui/lab/Autocomplete';
import { TextField } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';

interface CommoditiesMultiInputProps {
  data: string[];
  label?: string;
  selectedCommodities?: string[];
  onChange?: (commodities: string[]) => void;
}

const useStyles = makeStyles({
  customTextField: {
    '& .MuiAutocomplete-input': {
      width: '150px',
    },
    '& input::placeholder': {
      fontSize: '15px',
    },
  },
  input: {
    width: '300px',
  },
});

const CommoditiesMultiInput: React.FC<CommoditiesMultiInputProps> = ({
  data,
  label = '',
  selectedCommodities = [],
  onChange,
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
        <TextField
          {...params}
          label={label}
          placeholder="Add commodity &#9166;"
          variant="outlined"
        />
      )}
    />
  );
};

export default CommoditiesMultiInput;
