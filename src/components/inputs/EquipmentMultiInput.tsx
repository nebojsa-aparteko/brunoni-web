import React from 'react';
import Autocomplete from '@material-ui/lab/Autocomplete';
import { TextField } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import { MOCK_EQUIPMENT, getEquipmentDisplayName } from '../../data/equipment';

interface EquipmentMultiInputProps {
  label?: string;
  selectedEquipment?: string[];
  onChange?: (equipment: string[]) => void;
}

const useStyles = makeStyles({
  customTextField: {
    '& .MuiAutocomplete-input': {
      width: '200px',
    },
    '& input::placeholder': {
      fontSize: '15px',
    },
  },
  input: {
    width: '100%',
  },
});

const EquipmentMultiInput: React.FC<EquipmentMultiInputProps> = ({
  label = 'Equipment',
  selectedEquipment = [],
  onChange,
}) => {
  const classes = useStyles();

  // Convert equipment objects to display strings for options
  const equipmentOptions = MOCK_EQUIPMENT.map(equipment => getEquipmentDisplayName(equipment));

  return (
    <Autocomplete
      classes={{ root: classes.customTextField }}
      multiple
      freeSolo
      options={equipmentOptions}
      value={selectedEquipment}
      onChange={(_, newValue) => {
        // Filter out any 'Add "..."' suggestions and clean the values
        const cleanedValues = newValue.map(value => {
          if (typeof value === 'string' && value.startsWith('Add "') && value.endsWith('"')) {
            return value.slice(5, -1); // Remove 'Add "' and '"'
          }
          return value;
        });
        onChange?.(cleanedValues);
      }}
      filterOptions={(options, params) => {
        const { inputValue } = params;

        // First, filter existing equipment
        const filtered = options.filter(option =>
          option.toLowerCase().includes(inputValue.toLowerCase()),
        );

        // If typing custom text and it doesn't match existing equipment, suggest adding it
        if (
          inputValue !== '' &&
          !options.some(option => option.toLowerCase() === inputValue.toLowerCase())
        ) {
          filtered.push(`Add "${inputValue}"`);
        }

        return filtered;
      }}
      getOptionLabel={option => {
        // Handle the 'Add "..."' case
        if (typeof option === 'string' && option.startsWith('Add "') && option.endsWith('"')) {
          return option.slice(5, -1); // Remove 'Add "' and '"'
        }
        return option;
      }}
      renderInput={params => (
        <TextField
          {...params}
          label={label}
          placeholder="Select equipment or add custom equipment &#9166;"
          variant="outlined"
          fullWidth
        />
      )}
    />
  );
};

export default EquipmentMultiInput;
