import React, { useContext } from 'react';
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
import { useBookingsContext, useBookingsFilterDispatch } from '../../providers/BookingsProvider';
import UserInput from '../inputs/UserInput';
import UserRecord from '../../model/UserRecord';
import useAdminUsers from '../../hooks/useAdminUsers';

interface Props {
  showClientFilter?: boolean;
  showDateRange?: boolean;
  showRefreshButton?: boolean;
  showAssigneeFilter?: boolean;
}

const BookingsFiltersBar: React.FC<Props> = ({
  showClientFilter,
  showDateRange,
  showRefreshButton,
  showAssigneeFilter,
}) => {
  const clients = useClients();
  const users = useAdminUsers();
  const ports = useContext(Ports);

  const bookingFilterDispach = useBookingsFilterDispatch();

  const filters = useBookingsContext()[2];

  const { clientFilter, originPort, destinationPort, assignee, dateRange } = filters;

  const setOriginPort = (port: Port | null) =>
    bookingFilterDispach({
      type: port ? 'set' : 'clear',
      field: 'originPort',
      value: port || undefined,
    });
  const setDestinationPort = (port: Port | null) =>
    bookingFilterDispach({ type: port ? 'set' : 'clear', field: 'destinationPort', value: port || undefined });
  const setClientFilter = (client: Client | null) =>
    bookingFilterDispach({ type: client ? 'set' : 'clear', field: 'clientFilter', value: client || undefined });

  const setUserFilter = (user: UserRecord | null) =>
    bookingFilterDispach({ type: user ? 'set' : 'clear', field: 'assignee', value: user || undefined });

  const setDateRange = (dateRange: DateRange) =>
    bookingFilterDispach({ type: 'set', field: 'dateRange', value: dateRange });
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

        {!showClientFilter && <Grid item sm={3} xs={12} />}
        {showDateRange && (
          <Grid item sm={3} xs={12}>
            <Box display="flex" alignItems="flex-end" alignContent="flex-end" flexDirection="column" m="6px auto">
              <DateRangeInput onChange={setDateRange} value={dateRange} />
            </Box>
          </Grid>
        )}
        {showAssigneeFilter && !showDateRange && (
          <Grid item sm={3} xs={12}>
            <UserInput label="Choose User" users={users || []} onChange={setUserFilter} value={assignee} />
          </Grid>
        )}
      </Grid>
      {showAssigneeFilter && showDateRange && users && (
        <Grid container spacing={2} style={{ marginTop: 8 }}>
          <Grid item sm={9} xs={12} />
          <Grid item sm={3} xs={12}>
            <UserInput label="Choose User" users={users || []} onChange={setUserFilter} value={assignee} />
          </Grid>
        </Grid>
      )}
    </Box>
  );
};

export default BookingsFiltersBar;
