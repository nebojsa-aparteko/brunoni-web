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
  const [filters, setFilters] = useEquipmentControlFilterProviderContext();
  const { carrier } = filters;
  const summary = useEquipmentSummary(BookingCategory.Import);

  return (
    <Box>
      <Box pt={3} px={3}>
        <Typography variant="h4">Import Flows</Typography>
        <Box width="95vw" display="flex" flexDirection="row">
          <Box minWidth={250} maxWidth={400} my={3} mr={1}>
            <CarrierInput
              label="Select a carrier"
              onChange={carrier => setFilters(prevState => set('carrier', carrier)(prevState))}
              carriers={availableCarriers}
              value={carrier}
            />
          </Box>
        </Box>
      </Box>

      <ImportFlowsTable summary={summary} />
    </Box>
  );
};

export default ImportFlowsContainer;
