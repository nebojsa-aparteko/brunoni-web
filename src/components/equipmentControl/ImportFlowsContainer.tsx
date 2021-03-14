import React, { useContext } from 'react';
import { Box, Typography } from '@material-ui/core';
import CarrierInput from '../inputs/CarrierInput';
import Carriers from '../../contexts/Carriers';
import ImportFlowsTable from './ImportFlowsTable';
import useEquipmentSummary from '../../hooks/useEquipmentSummary';
import { useEquipmentControlFilterProviderContext } from '../../providers/EquipmentControlFilterProvider';
import { set } from 'lodash/fp';
import { BookingCategory } from '../../model/Booking';

const ImportFlowsContainer: React.FC = () => {
  const availableCarriers = useContext(Carriers);
  const summary = useEquipmentSummary(BookingCategory.Import);
  const [filters, setFilters] = useEquipmentControlFilterProviderContext();

  return (
    <Box width="95vw">
      <Typography variant="h4">Import Flows</Typography>
      <Box minWidth={250} maxWidth={400} margin={4} marginLeft={0} paddingRight={1}>
        <CarrierInput
          label="Select a carrier"
          onChange={carrier => setFilters(prevState => set('carrier', carrier)(prevState))}
          carriers={availableCarriers}
          value={filters.carrier}
        />
      </Box>
      <ImportFlowsTable summary={summary} />
    </Box>
  );
};

export default ImportFlowsContainer;
