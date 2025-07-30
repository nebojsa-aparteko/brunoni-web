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
  placeholder = 'Select equipment type ↵',
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
      options={displayOptions}
      value={getDisplayValues()}
      onChange={(_, newValue) => {
        const newEquipmentIds: string[] = [];
        const newEquipmentNames: string[] = [];

        newValue.forEach(value => {
          if (typeof value === 'string') {
            const cleanValue = value.trim();

            if (!cleanValue) {
              return;
            }

            // Only allow database equipment - find matching equipment
            const foundEquipment = equipmentOptions.find(
              equipment => getEquipmentDisplayName(equipment) === cleanValue,
            );

            if (foundEquipment) {
              newEquipmentIds.push(foundEquipment.id);
            }
          }
        });

        const uniqueEquipmentIds = [...new Set(newEquipmentIds)];

        onChange?.(uniqueEquipmentIds, []);
      }}
      filterOptions={(options, params) => {
        const { inputValue } = params;

        // Filter existing equipment only
        return options.filter(option => option.toLowerCase().includes(inputValue.toLowerCase()));
      }}
      getOptionLabel={option => option}
      renderInput={params => (
        <TextField {...params} label={label} placeholder={placeholder} variant="outlined" />
      )}
    />
  );
};

export default EquipmentMultiInput;
