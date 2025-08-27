import React, { useMemo } from 'react';
import { Box, Grid, TextField } from '@material-ui/core';
import Autocomplete from '@material-ui/lab/Autocomplete';
import set from 'lodash/fp/set';
import { OpportunityMatchStatus, opportunityToString } from '../../model/Opportunity';
import useClients from '../../hooks/useClients';
import ClientInput from '../inputs/ClientInput';
import Client from '../../model/Client';
import { useOpportunities } from './OpportunitiesDataProvider';

interface Props {
  filters: any;
  setFilters: any;
}

const ManualMatchingFiltersBar: React.FC<Props> = ({ filters, setFilters }) => {
  const opportunities = useOpportunities();
  const clients = useClients();
  const { opportunity, entityId, bookingParty } = filters;

  const setOpportunityFilter = (value: string | null) => {
    setFilters && setFilters(set('opportunity', value || '')(filters));
  };

  const setEntityIdFilter = (value: string) => {
    setFilters && setFilters(set('entityId', value)(filters));
  };

  const setBookingPartyFilter = (client: Client | null | undefined) =>
    setFilters && setFilters(set('bookingParty', client || undefined)(filters));

  const filterOptions = useMemo(
    () => [
      { id: '', label: 'All' },
      { id: OpportunityMatchStatus.Unmatched, label: 'Unmatched' },
      { id: OpportunityMatchStatus.Discarded, label: 'Discarded' },
      ...(opportunities || []).map(opp => ({
        id: opp.id,
        label: opportunityToString(opp),
      })),
    ],
    [opportunities],
  );

  const selectedValue = filterOptions.find(option => option.id === opportunity) || filterOptions[0];

  return (
    <Box
      display="flex"
      flexDirection="row-reverse"
      flexWrap="wrap"
      justifyContent="space-between"
      alignContent="space-around"
      minWidth={400}
      maxWidth={960}
      my={3}
      mr={1}
    >
      <Grid container spacing={2}>
        <Grid item sm={5} xs={12}>
          <Autocomplete
            options={filterOptions}
            getOptionLabel={option => option?.label || ''}
            value={selectedValue || null}
            onChange={(_, value) => setOpportunityFilter(value?.id || null)}
            renderInput={params => (
              <TextField {...params} label="Match status" variant="outlined" fullWidth />
            )}
          />
        </Grid>
        <Grid item sm={3} xs={12}>
          <TextField
            label="Booking / quote ID"
            variant="outlined"
            fullWidth
            value={entityId || ''}
            onChange={e => setEntityIdFilter(e.target.value)}
            placeholder="Search by booking / quote ID..."
          />
        </Grid>
        {clients && (
          <Grid item sm={4} xs={12}>
            <Box display="flex">
              <ClientInput
                label="Booking Party"
                clients={clients || []}
                onChange={setBookingPartyFilter}
                value={bookingParty}
              />
            </Box>
          </Grid>
        )}
      </Grid>
    </Box>
  );
};

export default ManualMatchingFiltersBar;
