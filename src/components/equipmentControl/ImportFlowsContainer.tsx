import React, { useContext, useState } from 'react';
import { Box, Typography } from '@material-ui/core';
import CarrierInput from '../inputs/CarrierInput';
import Carrier from '../../model/Carrier';
import Carriers from '../../contexts/Carriers';
import ImportFlowsTable from './ImportFlowsTable';
import useEquipmentSummary from '../../hooks/useEquipmentSummary';

const ImportFlowsContainer: React.FC = () => {
  const [selectedCarrier, setSelectedCarrier] = useState<Carrier | undefined>(undefined);
  const availableCarriers = useContext(Carriers);
  const summary = useEquipmentSummary('Hamburg Süd', ['005654']);

  return (
    <Box width="95vw">
      <Typography variant="h4">Import Flows</Typography>
      <Box minWidth={250} maxWidth={400} margin={4} marginLeft={0} paddingRight={1}>
        <CarrierInput
          label="Select a carrier"
          onChange={carrier => setSelectedCarrier(carrier || undefined)}
          carriers={availableCarriers}
          value={selectedCarrier}
        />
      </Box>
      <ImportFlowsTable summary={summary} />
    </Box>
  );
};

export default ImportFlowsContainer;
