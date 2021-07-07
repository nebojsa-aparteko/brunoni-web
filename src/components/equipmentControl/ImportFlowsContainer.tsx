import React, { useContext, useEffect } from 'react';
import { Box, Typography } from '@material-ui/core';
import Carriers from '../../contexts/Carriers';
import ImportFlowsTable from './ImportFlowsTable';
import useEquipmentSummary from '../../hooks/useEquipmentSummary';
import { useEquipmentControlFilterProviderContext } from '../../providers/EquipmentControlFilterProvider';
import { set } from 'lodash/fp';
import { BookingCategory } from '../../model/Booking';
import VersionFilter from '../VersionFilter';
import useUser from '../../hooks/useUser';

const ImportFlowsContainer: React.FC = () => {
  const user = useUser()[1];
  const carriers = useContext(Carriers);
  const [filters, setFilters] = useEquipmentControlFilterProviderContext();
  const { version } = filters;
  const summary = useEquipmentSummary(BookingCategory.Import);

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
    <Box width="95vw">
      <Typography variant="h4">Import Flows</Typography>
      <Box width="95vw" display="flex" flexDirection="row">
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
