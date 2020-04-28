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
import { useQuotesContext, useQuotesFilterDispatch } from '../../providers/QuotesProvider';
import UserRecord from '../../model/UserRecord';

interface Props {
  showClientFilter?: boolean;
  showRefreshButton?: boolean;
  showDateRange?: boolean;
}

const QuotesFiltersBar: React.FC<Props> = ({ showClientFilter, showDateRange, showRefreshButton }) => {
  const clients = useClients();
  const ports = useContext(Ports);

  const quotesFilterDispatch = useQuotesFilterDispatch();

  const filters = useQuotesContext()[1];

  const { clientFilter, originPort, destinationPort, dateRange } = filters;

  const setOriginPort = (port: Port | null) =>
    quotesFilterDispatch({
      type: port ? 'set' : 'clear',
      field: 'originPort',
      value: port || undefined,
    });
  const setDestinationPort = (port: Port | null) =>
    quotesFilterDispatch({ type: port ? 'set' : 'clear', field: 'destinationPort', value: port || undefined });
  const setClientFilter = (client: Client | null) =>
    quotesFilterDispatch({ type: client ? 'set' : 'clear', field: 'clientFilter', value: client || undefined });

  const setUserFilter = (user: UserRecord | null) =>
    quotesFilterDispatch({ type: user ? 'set' : 'clear', field: 'assignee', value: user || undefined });

  const setDateRange = (dateRange: DateRange) =>
    quotesFilterDispatch({ type: 'set', field: 'dateRange', value: dateRange });

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
      </Grid>
    </Box>
  );
};

export default QuotesFiltersBar;
