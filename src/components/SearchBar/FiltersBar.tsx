import React, { useContext, useState } from 'react';
import { Box, Grid } from '@material-ui/core';
import ClientInput from '../inputs/ClientInput';
import SynchronizeButton from '../SynchronizeButton';
import PortInput from '../inputs/PortInput';
import DateRangeInput from '../inputs/DateRangeInput';
import { DateRange } from '../DateRangePicker/types';
import useClients from '../../hooks/useClients';
import Ports from '../../contexts/Ports';
import Port from '../../model/Port';
import set from 'lodash/fp/set';
import Client from '../../model/Client';

interface Props {
  listContextData: any;
  setQuoteListContextData: any;
  showCompanyInfo?: boolean;
  dateRange?: DateRange;
  setDateRange: any;
  showRefreshButton?: boolean;
}

const FiltersBar: React.FC<Props> = ({
  listContextData,
  setQuoteListContextData,
  showCompanyInfo,
  dateRange,
  setDateRange,
  showRefreshButton,
}) => {
  const clients = useClients();
  const ports = useContext(Ports);

  const { clientFilter, originPort, destinationPort } = listContextData;

  const setOriginPort = (port: Port) => setQuoteListContextData(set('originPort', port)(listContextData));
  const setDestinationPort = (port: Port) => setQuoteListContextData(set('destinationPort', port)(listContextData));
  const setClientFilter = (client: Client) => setQuoteListContextData(set('clientFilter', client)(listContextData));

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
        {showCompanyInfo && (
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
          <PortInput label="Origin" ports={ports} value={originPort} onChange={setOriginPort} />
        </Grid>
        <Grid item sm={3} xs={12}>
          <PortInput label="Destination" ports={ports} value={destinationPort} onChange={setDestinationPort} />
        </Grid>

        {!showCompanyInfo && <Grid item sm={3} xs={12} />}
        <Grid item sm={3} xs={12}>
          <Box display="flex" alignItems="flex-end" alignContent="flex-end" flexDirection="column" m="6px auto">
            <DateRangeInput onChange={setDateRange} />
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
};

export default FiltersBar;
