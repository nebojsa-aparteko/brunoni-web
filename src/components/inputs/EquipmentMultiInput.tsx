import React, { useContext } from 'react';
import Autocomplete from '@material-ui/lab/Autocomplete';
import { TextField } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import ContainerTypes from '../../contexts/ContainerTypes';

interface EquipmentMultiInputProps {
  label?: string;
  selectedEquipmentIds?: string[];
  selectedEquipmentNames?: string[];
  onChange?: (equipmentIds: string[], equipmentNames: string[]) => void;
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

const EquipmentMultiInput: React.FC<EquipmentMultiInputProps> = ({
  label = 'Equipment',
  selectedEquipmentIds = [],
  selectedEquipmentNames = [],
  onChange,
  placeholder = 'Select equipment type or add custom equipment ↵',
}) => {
  const classes = useStyles();
  const containerTypes = useContext(ContainerTypes);

  // Create options with both ID and display text
  const equipmentOptions = containerTypes || [];

  // Get equipment display name
  const getEquipmentDisplayName = (equipment: any): string => {
    return equipment.description || equipment.name || equipment.id;
  };

  // Create display values combining both selected database equipment and custom equipment names
  const getDisplayValues = () => {
    const values: string[] = [];

    // Add selected database equipment (by their display names)
    selectedEquipmentIds.forEach(equipmentId => {
      const equipment = equipmentOptions.find(eq => eq.id === equipmentId);
      if (equipment) {
        values.push(getEquipmentDisplayName(equipment));
      }
    });

    // Add custom equipment names
    values.push(...selectedEquipmentNames);

    return values;
  };

  // Create options from database equipment
  const displayOptions = equipmentOptions.map(equipment => getEquipmentDisplayName(equipment));

  return (
    <Autocomplete
      classes={{ root: classes.customTextField }}
      multiple
      freeSolo
      options={displayOptions}
      value={getDisplayValues()}
      onChange={(_, newValue) => {
        const newEquipmentIds: string[] = [];
        const newEquipmentNames: string[] = [];

        newValue.forEach(value => {
          // Clean up "Add ..." suggestions
          let cleanValue = value;
          if (typeof value === 'string' && value.startsWith('Add "') && value.endsWith('"')) {
            cleanValue = value.slice(5, -1);
          }

          if (typeof cleanValue === 'string') {
            cleanValue = cleanValue.trim();
          }

          if (!cleanValue) {
            return;
          }

          // Check if this value matches a database equipment
          const foundEquipment = equipmentOptions.find(
            equipment => getEquipmentDisplayName(equipment) === cleanValue,
          );

          if (foundEquipment) {
            // It's a database equipment - add to equipmentIds
            newEquipmentIds.push(foundEquipment.id);
          } else {
            // It's a custom equipment name - add to equipmentNames
            newEquipmentNames.push(cleanValue);
          }
        });

        const uniqueEquipmentIds = [...new Set(newEquipmentIds)];
        const uniqueEquipmentNames = newEquipmentNames.filter(
          (name, index, array) =>
            array.findIndex(item => item.toLowerCase() === name.toLowerCase()) === index,
        );

        onChange?.(uniqueEquipmentIds, uniqueEquipmentNames);
      }}
      filterOptions={(options, params) => {
        const { inputValue } = params;

        // Filter existing equipment
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
          return option.slice(5, -1);
        }
        return option;
      }}
      renderInput={params => (
        <TextField {...params} label={label} placeholder={placeholder} variant="outlined" />
      )}
    />
  );
};

export default EquipmentMultiInput;
