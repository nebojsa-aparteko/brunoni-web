import React, { useContext } from 'react';
import { Box, Typography } from '@material-ui/core';
import CarrierInput from '../inputs/CarrierInput';
import Carriers from '../../contexts/Carriers';
import ImportFlowsTable from './ImportFlowsTable';
import useEquipmentSummary from '../../hooks/useEquipmentSummary';
import { useEquipmentControlFilterProviderContext } from '../../providers/EquipmentControlFilterProvider';
import { set } from 'lodash/fp';
import { BookingCategory } from '../../model/Booking';
import VersionFilter from '../VersionFilter';

const ImportFlowsContainer: React.FC = () => {
  const availableCarriers = useContext(Carriers);
  const [filters, setFilters] = useEquipmentControlFilterProviderContext();
  const { version, carrier } = filters;
  const summary = useEquipmentSummary(BookingCategory.Import, filters.version);

  return (
    <Box width="95vw">
      <Typography variant="h4">Import Flows</Typography>
      <Box width="95vw" display="flex" flexDirection="row">
        <Box minWidth={250} maxWidth={400} margin={4} marginLeft={0} paddingRight={1}>
          <CarrierInput
            label="Select a carrier"
            onChange={carrier => setFilters(prevState => set('carrier', carrier)(prevState))}
            carriers={availableCarriers}
            value={carrier}
          />
        </Box>
        <VersionFilter
          value={version}
          onChange={event => setFilters(prevState => set('version', event.target.value)(prevState))}
        />
      </Box>

      <ImportFlowsTable summary={summary} />
    </Box>
  );
};

export default ImportFlowsContainer;
