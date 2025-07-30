import React, { useState, useEffect } from 'react';
import Autocomplete from '@material-ui/lab/Autocomplete';
import { TextField } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import firebase from '../../firebase';

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
  selectedPortNames?: string[];
  onChange?: (portIds: string[], portNames: string[]) => void;
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
  selectedPortNames = [],
  onChange,
  placeholder = 'Select ports or add custom port ↵',
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

  // Create display values combining both selected database ports and custom port names
  const getDisplayValues = () => {
    const values: string[] = [];

    // Add selected database ports (by their display names)
    selectedPortIds.forEach(portId => {
      const port = ports.find(p => p.id === portId);
      if (port) {
        values.push(getPortDisplayName(port));
      }
    });

    // Add custom port names
    values.push(...selectedPortNames);

    return values;
  };

  // Create options from database ports
  const portOptions = ports.map(port => getPortDisplayName(port));

  return (
    <Autocomplete
      classes={{ root: classes.customTextField }}
      multiple
      freeSolo // Allow free text input
      options={portOptions}
      value={getDisplayValues()}
      onChange={(_, newValue) => {
        const newPortIds: string[] = [];
        const newPortNames: string[] = [];

        newValue.forEach(value => {
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

          // Check if this value matches a database port
          const foundPort = ports.find(port => getPortDisplayName(port) === cleanValue);

          if (foundPort) {
            // It's a database port - add to portIds
            newPortIds.push(foundPort.id);
          } else {
            // It's a custom port name - add to portNames
            newPortNames.push(cleanValue);
          }
        });

        const uniquePortIds = [...new Set(newPortIds)];
        const uniquePortNames = newPortNames.filter(
          (name, index, array) =>
            array.findIndex(item => item.toLowerCase() === name.toLowerCase()) === index,
        );

        onChange?.(uniquePortIds, uniquePortNames);
      }}
      filterOptions={(options, params) => {
        const { inputValue } = params;

        // Filter existing ports
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
          return option.slice(5, -1);
        }
        return option;
      }}
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
