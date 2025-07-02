import React, { useState, useEffect } from 'react';
import Autocomplete from '@material-ui/lab/Autocomplete';
import { TextField } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import firebase from 'firebase/compat/app';

interface Port {
  id: string;
  name: string;
  code?: string;
  country?: string;
  city?: string;
}

interface PortsMultiInputProps {
  label?: string;
  selectedPortIds?: string[];
  onChange?: (portIds: string[]) => void;
  placeholder?: string;
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
});

const getPortDisplayName = (port: Port): string => {
  if (port.code && port.city && port.country) {
    return `${port.code} - ${port.city}, ${port.country}`;
  } else if (port.city && port.country) {
    return `${port.city}, ${port.country}`;
  } else if (port.name) {
    return port.name;
  }
  return port.id;
};

const PortsMultiInput: React.FC<PortsMultiInputProps> = ({
  label = 'Ports',
  selectedPortIds = [],
  onChange,
  placeholder = 'Select ports ↵',
}) => {
  const classes = useStyles();
  const [ports, setPorts] = useState<Port[]>([]);
  const [loading, setLoading] = useState(true);

  // Load ports from Firestore
  useEffect(() => {
    const loadPorts = async () => {
      try {
        const snapshot = await firebase.firestore().collection('ports').get();
        const portsData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        })) as Port[];
        setPorts(portsData);
      } catch (error) {
        console.error('Error loading ports:', error);
      } finally {
        setLoading(false);
      }
    };

    loadPorts();
  }, []);

  // Create port options from loaded ports
  const portOptions = ports || [];

  // Get selected ports based on IDs
  const selectedPorts = ports?.filter(port => selectedPortIds.includes(port.id)) || [];

  return (
    <Autocomplete
      classes={{ root: classes.customTextField }}
      multiple
      options={portOptions}
      value={selectedPorts}
      onChange={(_, newValue) => {
        const selectedIds = newValue.map(port => port.id);
        onChange?.(selectedIds);
      }}
      getOptionLabel={option => getPortDisplayName(option)}
      getOptionSelected={(option, value) => option.id === value.id}
      renderInput={params => (
        <TextField
          {...params}
          label={label}
          placeholder={loading ? 'Loading ports...' : placeholder}
          variant="outlined"
          disabled={loading}
        />
      )}
    />
  );
};

export default PortsMultiInput;
