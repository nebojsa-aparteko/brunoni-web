import React from 'react';
import Chip from '@material-ui/core/Chip';
import Autocomplete from '@material-ui/lab/Autocomplete';
import { TextField } from '@material-ui/core';
import { Place } from '../../model/DeliveryGroup';
interface Props {
  options: Place[];
  defaultValues?: Place[];
  onChange: (event: React.ChangeEvent<{}>, value: Place | Place[] | null) => void;
}

const PlacesMultiInput: React.FC<Props> = ({ options, defaultValues, onChange }) => {
  return (
    <Autocomplete
      multiple
      autoHighlight
      options={options}
      getOptionSelected={(option, value) => option.name === value.name}
      getOptionLabel={option => `${option.name}`}
      defaultValue={defaultValues}
      onChange={onChange}
      renderTags={(value, getTagProps) =>
        value.map((option, index) => <Chip label={`${option.name}`} {...getTagProps({ index })} />)
      }
      renderInput={params => (
        <TextField {...params} label="Carriers" placeholder="Type to filter" variant="outlined" />
      )}
    />
  );
};

export default PlacesMultiInput;
