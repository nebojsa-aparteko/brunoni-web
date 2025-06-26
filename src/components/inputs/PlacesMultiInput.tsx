import React from 'react';
import Autocomplete from '@material-ui/lab/Autocomplete';
import { TextField } from '@material-ui/core';

import { makeStyles } from '@material-ui/core/styles';

interface MultiPlacesInputInterface {
  data: string[];
  label?: string;
  // setSelectedPlaces: (places: string[]) => void;
  selectedPlaces?: string[];
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

const PlacesMultiInput: React.FC<MultiPlacesInputInterface> = ({
  data,
  label = '',
  // setSelectedPlaces,
  selectedPlaces = [],
}) => {
  const classes = useStyles();
  return (
    <Autocomplete
      classes={{ root: classes.customTextField }}
      multiple
      freeSolo
      options={data}
      value={selectedPlaces}
      // onChange={(_, newValue) => {
      //   setSelectedPlaces(newValue);
      // }}
      renderInput={params => (
        <TextField {...params} label={label} placeholder="Add place &#9166;" variant="outlined" />
      )}
    />
  );
};

export default PlacesMultiInput;
