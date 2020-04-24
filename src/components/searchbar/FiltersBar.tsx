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
import set from 'lodash/fp/set';
import Client from '../../model/Client';
import { QuoteListStateParams } from '../../providers/QuoteListFilterContext';

interface Props {
  listContextData: QuoteListStateParams;
  setQuoteListContextData: any;
  showClientFilter?: boolean;
  showRefreshButton?: boolean;
  showDateRange?: boolean;
}

const FiltersBar: React.FC<Props> = ({
  listContextData,
  setQuoteListContextData,
  showClientFilter,
  showDateRange,
  showRefreshButton,
}) => {
  const clients = useClients();
  const ports = useContext(Ports);

  const { clientFilter, originPort, destinationPort, dateRange } = listContextData;

  const setOriginPort = (port: Port | null) => setQuoteListContextData(set('originPort', port)(listContextData));
  const setDestinationPort = (port: Port | null) =>
    setQuoteListContextData(set('destinationPort', port)(listContextData));
  const setClientFilter = (client: Client | null) =>
    setQuoteListContextData(set('clientFilter', client)(listContextData));

  const setDateRange = (dateRange: DateRange) => {
    setQuoteListContextData(set('dateRange', dateRange)(listContextData));
  };

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
              <ClientInput label="Choose Client" clients={clients} onChange={setClientFilter} value={clientFilter} />
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

export default FiltersBar;
