import React from 'react';
import { Box, Grid, TextField } from '@material-ui/core';
import Autocomplete from '@material-ui/lab/Autocomplete';
import set from 'lodash/fp/set';
import useOpportunities from '../../hooks/useOpportunities';

interface Props {
  filters: any;
  setFilters: any;
}

const ManualMatchingFiltersBar: React.FC<Props> = ({ filters, setFilters }) => {
  const opportunities = useOpportunities();
  const { opportunity } = filters;

  const setOpportunityFilter = (value: string | null) => {
    setFilters && setFilters(set('opportunity', value || 'unmatched')(filters));
  };

  // Create options array with "Unmatched" as first option
  const filterOptions = [
    { id: 'unmatched', label: 'Unmatched' },
    ...(opportunities || []).map(opp => ({
      id: opp.id,
      label: `${opp.opportunityId || opp.id} - ${opp.bookingPartyId?.name}`,
    })),
  ];

  const selectedValue = filterOptions.find(option => option.id === opportunity) || filterOptions[0];

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
        <Grid item sm={6} xs={12}>
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
      </Grid>
    </Box>
  );
};

export default ManualMatchingFiltersBar;
