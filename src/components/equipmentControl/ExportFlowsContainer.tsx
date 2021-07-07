import React, { useContext, useEffect } from 'react';
import { Box, Typography } from '@material-ui/core';
import useEquipmentSummary from '../../hooks/useEquipmentSummary';
import { BookingCategory } from '../../model/Booking';
import ExportFlowsTable from './ExportFlowsTable';
import { set } from 'lodash/fp';
import VersionFilter from '../VersionFilter';
import Carriers from '../../contexts/Carriers';
import { useEquipmentControlFilterProviderContext } from '../../providers/EquipmentControlFilterProvider';
import useUser from '../../hooks/useUser';

const ExportFlowsContainer: React.FC = () => {
  const user = useUser()[1];
  const summary = useEquipmentSummary(BookingCategory.Export);
  const carriers = useContext(Carriers);
  const [filters, setFilters] = useEquipmentControlFilterProviderContext();
  const { version } = filters;

  useEffect(() => {
    user.carrier &&
      setFilters &&
      setFilters(
        set(
          'carrier',
          carriers?.find(carrier => carrier.id === user.carrier),
        )(filters),
      );
  }, [user.carrier, carriers]);

  return (
    <Box>
      <Typography variant="h4">Export Flows</Typography>
      <Box width="95vw" display="flex" flexDirection="row">
        <VersionFilter
          value={version}
          onChange={event => setFilters(prevState => set('version', event.target.value)(prevState))}
        />
      </Box>
      <ExportFlowsTable summary={summary} />
    </Box>
  );
};

export default ExportFlowsContainer;
