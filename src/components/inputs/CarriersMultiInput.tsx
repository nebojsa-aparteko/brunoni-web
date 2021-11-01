import React, { useContext } from 'react';
import Chip from '@material-ui/core/Chip';
import Autocomplete from '@material-ui/lab/Autocomplete';
import { TextField } from '@material-ui/core';
import Carrier from '../../model/Carrier';
import Carriers from '../../contexts/Carriers';

interface Props {
  value?: Carrier[];
  onChange: (event: React.ChangeEvent<{}>, value: Carrier | Carrier[] | null) => void;
}

const CarriersMultiInput: React.FC<Props> = ({ value = [], onChange }) => {
  const carriers = useContext(Carriers);
  return (
    <Autocomplete
      multiple
      autoHighlight
      options={carriers || []}
      getOptionSelected={(option, value) => option.name === value.name}
      getOptionLabel={option => `${option.name}`}
      value={value}
      onChange={onChange}
      renderTags={(value, getTagProps) =>
        value.map((option, index) => <Chip label={`${option.name}`} {...getTagProps({ index })} />)
      }
      renderInput={params => <TextField {...params} label="Carriers" placeholder="Type to filter" variant="outlined" />}
    />
  );
};

export default CarriersMultiInput;
