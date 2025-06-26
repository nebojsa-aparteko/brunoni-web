import React from 'react';
import Autocomplete from '@material-ui/lab/Autocomplete';
import { TextField } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import { MOCK_PORTS, getPortDisplayName, searchPorts } from '../../data/ports';

interface PortsMultiInputProps {
  label?: string;
  selectedPorts?: string[];
  onChange?: (ports: string[]) => void;
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

const PortsMultiInput: React.FC<PortsMultiInputProps> = ({
  label = 'Ports',
  selectedPorts = [],
  onChange,
}) => {
  const classes = useStyles();

  // Convert port objects to display strings for options
  const portOptions = MOCK_PORTS.map(port => getPortDisplayName(port));

  return (
    <Autocomplete
      classes={{ root: classes.customTextField }}
      multiple
      freeSolo
      options={portOptions}
      value={selectedPorts}
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

        // First, filter existing ports
        const filtered = options.filter(option =>
          option.toLowerCase().includes(inputValue.toLowerCase()),
        );

        // If typing custom text and it doesn't match existing ports, suggest adding it
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
          placeholder="Select port or add custom port &#9166;"
          variant="outlined"
          fullWidth
        />
      )}
    />
  );
};

export default PortsMultiInput;
