import React, { ChangeEvent } from 'react';
import { Autocomplete } from '@material-ui/lab';
import { TextField } from '@material-ui/core';

const defaultTransportModes = ['Barge', 'Barge + Truck', 'Rail + Barge', 'Rail + Truck'];

interface Props {
  value?: string | null;
  onChange: (transportMode: string | null) => void;
  transportModes?: string[];
}

const TransportModeInput: React.FC<Props> = ({ transportModes = defaultTransportModes, onChange }) => {
  return (
    <Autocomplete
      id="transport-modes-input"
      options={transportModes}
      onChange={(_: ChangeEvent<{}>, mode: string | null) => onChange(mode)}
      getOptionLabel={option => option}
      renderInput={params => <TextField {...params} fullWidth label="Preferred transport mode" variant="outlined" />}
    />
  );
};

export default TransportModeInput;
