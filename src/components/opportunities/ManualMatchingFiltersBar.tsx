import React from 'react';
import { Box, Grid, TextField } from '@material-ui/core';
import Autocomplete from '@material-ui/lab/Autocomplete';
import set from 'lodash/fp/set';
import useOpportunities from '../../hooks/useOpportunities';
import { opportunityToString } from '../../model/Opportunity';
import useClients from '../../hooks/useClients';
import ClientInput from '../inputs/ClientInput';
import Client from '../../model/Client';

interface Props {
  filters: any;
  setFilters: any;
}

const ManualMatchingFiltersBar: React.FC<Props> = ({ filters, setFilters }) => {
  const opportunities = useOpportunities();
  const clients = useClients();
  const { opportunity, entityId, bookingParty } = filters;

  const setOpportunityFilter = (value: string | null) => {
    setFilters && setFilters(set('opportunity', value || 'unmatched')(filters));
  };

  const setEntityIdFilter = (value: string) => {
    setFilters && setFilters(set('entityId', value)(filters));
  };

  const setBookingPartyFilter = (client: Client | null | undefined) =>
    setFilters && setFilters(set('bookingParty', client || undefined)(filters));

  const filterOptions = [
    { id: 'unmatched', label: 'Unmatched' },
    ...(opportunities || []).map(opp => ({
      id: opp.id,
      label: opportunityToString(opp),
    })),
  ];

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
        <Grid item sm={3} xs={12}>
          <Autocomplete
            options={filterOptions}
            getOptionLabel={option => option.label}
            value={selectedValue}
            onChange={(_, value) => setOpportunityFilter(value?.id || 'unmatched')}
            renderInput={params => (
              <TextField {...params} label="Opportunity" variant="outlined" fullWidth />
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
          <Grid item sm={3} xs={12}>
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
