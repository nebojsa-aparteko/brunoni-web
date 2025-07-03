import React, { useContext } from 'react';
import Autocomplete from '@material-ui/lab/Autocomplete';
import { TextField } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import ContainerTypes from '../../contexts/ContainerTypes';

interface EquipmentMultiInputProps {
  label?: string;
  selectedEquipmentIds?: string[];
  onChange?: (equipmentIds: string[]) => void;
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
  onChange,
  placeholder = 'Select equipment type ↵',
}) => {
  const classes = useStyles();
  const containerTypes = useContext(ContainerTypes);

  // Create options with both ID and display text
  const equipmentOptions = containerTypes || [];

  // Get selected container types based on IDs
  const selectedContainerTypes =
    containerTypes?.filter(ct => selectedEquipmentIds.includes(ct.id)) || [];

  return (
    <Autocomplete
      classes={{ root: classes.customTextField }}
      multiple
      options={equipmentOptions}
      value={selectedContainerTypes}
      onChange={(_, newValue) => {
        const selectedIds = newValue.map(containerType => containerType.id);
        onChange?.(selectedIds);
      }}
      getOptionLabel={option => option.description || option.name || option.id}
      getOptionSelected={(option, value) => option.id === value.id}
      renderInput={params => (
        <TextField {...params} label={label} placeholder={placeholder} variant="outlined" />
      )}
    />
  );
};

export default EquipmentMultiInput;
