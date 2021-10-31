import { BookingCategory } from '../../model/Booking';
import Chip from '@material-ui/core/Chip';
import { TextField } from '@material-ui/core';
import Autocomplete from '@material-ui/lab/Autocomplete';
import React from 'react';

interface Props {
  value?: BookingCategory[];
  onChange: (event: React.ChangeEvent<{}>, value: string | string[] | null) => void;
}

const MultipleCategoryInput: React.FC<Props> = ({ value = [], onChange }) => {
  return (
    <Autocomplete
      multiple
      autoHighlight
      options={Object.keys(BookingCategory) || []}
      getOptionSelected={(option, value) => option === value}
      value={value}
      onChange={onChange}
      renderTags={(value, getTagProps) =>
        value.map((option, index) => <Chip key={index} label={option} {...getTagProps({ index })} />)
      }
      renderInput={params => (
        <TextField {...params} label="Categories" placeholder="Type to filter" variant="outlined" />
      )}
    />
  );
};

export default MultipleCategoryInput;
