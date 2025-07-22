import React from 'react';
import Autocomplete from '@material-ui/lab/Autocomplete';
import { TextField } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';

interface MultiPlacesInputInterface {
  data?: string[];
  label?: string;
  selectedPlaces?: string[];
  onChange?: (places: string[]) => void;
  placeholder?: string;
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
});

const PlacesMultiInput: React.FC<MultiPlacesInputInterface> = ({
  data = [],
  label = 'Places',
  selectedPlaces = [],
  onChange,
  placeholder = 'Add place ↵',
}) => {
  const classes = useStyles();

  return (
    <Autocomplete
      classes={{ root: classes.customTextField }}
      multiple
      freeSolo
      options={data}
      value={selectedPlaces}
      onChange={(_, newValue) => {
        onChange?.(newValue);
      }}
      renderInput={params => (
        <TextField {...params} label={label} placeholder={placeholder} variant="outlined" />
      )}
    />
  );
};

export default PlacesMultiInput;
