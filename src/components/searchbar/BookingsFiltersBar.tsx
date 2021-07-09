import React, { useContext, useMemo } from 'react';
import { Box, Grid } from '@material-ui/core';
import ClientInput from '../inputs/ClientInput';
import SynchronizeButton from '../SynchronizeButton';
import PortInput from '../inputs/PortInput';
import DateRangeInput from '../inputs/DateRangeInput';
import { DateRange } from '../daterangepicker/types';
import useClients from '../../hooks/useClients';
import Ports from '../../contexts/Ports';
import Port from '../../model/Port';
import Client from '../../model/Client';
import UserInput from '../inputs/UserInput';
import UserRecord from '../../model/UserRecord';
import useAdminUsers from '../../hooks/useAdminUsers';
import set from 'lodash/fp/set';
import Carrier from '../../model/Carrier';
import CarrierInput from '../inputs/CarrierInput';
import Carriers from '../../contexts/Carriers';
import useUser from '../../hooks/useUser';

interface Props {
  filters: any;
  setFilters: any;
  showClientFilter?: boolean;
  showDateRange?: boolean;
  showRefreshButton?: boolean;
  showAssigneeFilter?: boolean;
}

const BookingsFiltersBar: React.FC<Props> = ({
  filters,
  setFilters,
  showClientFilter,
  showDateRange,
  showRefreshButton,
  showAssigneeFilter,
}) => {
  const clients = useClients();
  const users = useAdminUsers();
  const ports = useContext(Ports);
  const carriers = useContext(Carriers);
  const user = useUser()[1];

  const availableCarriers = useMemo(() => carriers?.filter(carrier => user.carriers?.includes(carrier.id)), [
    user.carriers,
    carriers,
  ]);

  const { clientFilter, originPort, destinationPort, assignee, dateRange, carrier } = filters;

  const setOriginPort = (port: Port | null) => setFilters && setFilters(set('originPort', port || undefined)(filters));

  const setDestinationPort = (port: Port | null) =>
    setFilters && setFilters(set('destinationPort', port || undefined)(filters));

  const setClientFilter = (client: Client | null | undefined) =>
    setFilters && setFilters(set('clientFilter', client || undefined)(filters));

  const setUserFilter = (user: UserRecord | null) =>
    setFilters && setFilters(set('assignee', user || undefined)(filters));

  const setDateRange = (dateRange: DateRange) =>
    setFilters && setFilters(set('dateRange', dateRange || undefined)(filters));

  const setCarrier = (carrier: Carrier | null | undefined) =>
    setFilters && setFilters(set('carrier', carrier || undefined)(filters));

  return (
    <Box
      display="flex"
      flexDirection="row-reverse"
      flexWrap="wrap"
      my={2}
      justifyContent="space-between"
      alignContent="space-around"
    >
      <Grid container spacing={2}>
        {showClientFilter && (
          <Grid item sm={3} xs={12}>
            <Box display="flex">
              <ClientInput
                label="Choose Client"
                clients={clients || []}
                onChange={setClientFilter}
                value={clientFilter}
              />
              {showRefreshButton && clientFilter && (
                <SynchronizeButton collection="quotes" alphacomClientId={clientFilter.id} />
              )}
            </Box>
          </Grid>
        )}
        <Grid item sm={3} xs={12}>
          <PortInput label="Origin" ports={ports || []} value={originPort} onChange={setOriginPort} />
        </Grid>
        <Grid item sm={3} xs={12}>
          <PortInput label="Destination" ports={ports || []} value={destinationPort} onChange={setDestinationPort} />
        </Grid>

        {showDateRange && (
          <Grid item sm={3} xs={12}>
            <Box display="flex" alignItems="flex-end" alignContent="flex-end" flexDirection="column" m="6px auto">
              <DateRangeInput onChange={setDateRange} value={dateRange} maxDate={new Date()} />
            </Box>
          </Grid>
        )}
        {showAssigneeFilter && !showDateRange && users && (
          <Grid item sm={3} xs={12}>
            <UserInput
              label="Choose User"
              users={users || []}
              onChange={(_, user) => setUserFilter(user)}
              value={assignee}
            />
          </Grid>
        )}
        <Grid item sm={3} xs={12}>
          <CarrierInput label={'Choose Carrier'} carriers={availableCarriers} onChange={setCarrier} value={carrier} />
        </Grid>
      </Grid>
      {showAssigneeFilter && showDateRange && users && (
        <Grid container spacing={2} style={{ marginTop: 8 }}>
          <Grid item sm={9} xs={12} />
          <Grid item sm={3} xs={12}>
            <UserInput
              label="Choose User"
              users={users || []}
              onChange={(_, user) => setUserFilter(user)}
              value={assignee}
            />
          </Grid>
        </Grid>
      )}
    </Box>
  );
};

export default BookingsFiltersBar;
