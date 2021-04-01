import React, { useContext } from 'react';
import { Box, Typography } from '@material-ui/core';
import useEquipmentSummary from '../../hooks/useEquipmentSummary';
import { BookingCategory } from '../../model/Booking';
import ExportFlowsTable from './ExportFlowsTable';
import CarrierInput from '../inputs/CarrierInput';
import { set } from 'lodash/fp';
import Carriers from '../../contexts/Carriers';
import { useEquipmentControlFilterProviderContext } from '../../providers/EquipmentControlFilterProvider';

const ExportFlowsContainer: React.FC = () => {
  const summary = useEquipmentSummary(BookingCategory.Export);
  const availableCarriers = useContext(Carriers);
  const [filters, setFilters] = useEquipmentControlFilterProviderContext();
  const { carrier } = filters;

  return (
    <Box>
      <Box p={3}>
        <Typography variant="h4">Export Flows</Typography>
        <Box width="95vw" display="flex" flexDirection="row">
          <Box minWidth={250} maxWidth={400} margin={4} marginLeft={0} paddingRight={1}>
            <CarrierInput
              label="Select a carrier"
              onChange={carrier => setFilters(prevState => set('carrier', carrier)(prevState))}
              carriers={availableCarriers}
              value={carrier}
            />
          </Box>
        </Box>
      </Box>

      <ExportFlowsTable summary={summary} />
    </Box>
  );
};

export default ExportFlowsContainer;
