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
import { useQuotesContext } from '../../providers/QuotesProvider';
import set from 'lodash/fp/set';
import Carrier from '../../model/Carrier';
import CarrierInput from '../inputs/CarrierInput';
import Carriers from '../../contexts/Carriers';
import useUser from '../../hooks/useUser';

interface Props {
  showClientFilter?: boolean;
  showRefreshButton?: boolean;
  showDateRange?: boolean;
}

const QuotesFiltersBar: React.FC<Props> = ({ showClientFilter, showDateRange, showRefreshButton }) => {
  const clients = useClients();
  const ports = useContext(Ports);
  const carriers = useContext(Carriers);
  const user = useUser()[1];

  const availableCarriers = useMemo(() => carriers?.filter(carrier => user.carriers?.includes(carrier.id)), [
    user.carriers,
    carriers,
  ]);

  const [, , filters, setFilters] = useQuotesContext();

  const { clientFilter, originPort, destinationPort, dateRange, carrier } = filters;

  const setOriginPort = (port: Port | null) => setFilters && setFilters(set('originPort', port || undefined)(filters));

  const setDestinationPort = (port: Port | null) =>
    setFilters && setFilters(set('destinationPort', port || undefined)(filters));

  const setClientFilter = (client: Client | null | undefined) =>
    setFilters && setFilters(set('clientFilter', client || undefined)(filters));

  const setCarrier = (carrier: Carrier | null | undefined) =>
    setFilters && setFilters(set('carrier', carrier || undefined)(filters));

  const setDateRange = (dateRange: DateRange) =>
    setFilters && setFilters(set('dateRange', dateRange || undefined)(filters));

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
        <Grid id="originQuotes" item sm={3} xs={12}>
          <PortInput label="Origin" ports={ports || []} value={originPort} onChange={setOriginPort} />
        </Grid>
        <Grid id="destinationQuotes" item sm={3} xs={12}>
          <PortInput label="Destination" ports={ports || []} value={destinationPort} onChange={setDestinationPort} />
        </Grid>
        <Grid id="carrierQuotes" item sm={3} xs={12}>
          <CarrierInput
            label={'Choose Carrier'}
            carriers={availableCarriers || []}
            value={carrier}
            onChange={setCarrier}
          />
        </Grid>

        {!showClientFilter && <Grid item sm={3} xs={12} />}
        {showDateRange && (
          <Grid item sm={3} xs={12}>
            <Box display="flex" alignItems="flex-end" alignContent="flex-end" flexDirection="column" m="6px auto">
              <DateRangeInput onChange={setDateRange} value={dateRange} maxDate={new Date()} />
            </Box>
          </Grid>
        )}
      </Grid>
    </Box>
  );
};

export default QuotesFiltersBar;
