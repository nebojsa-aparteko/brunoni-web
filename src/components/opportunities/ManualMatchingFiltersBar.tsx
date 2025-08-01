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
  const { opportunity, entityId } = filters;

  const setOpportunityFilter = (value: string | null) => {
    setFilters && setFilters(set('opportunity', value || 'unmatched')(filters));
  };

  const setEntityIdFilter = (value: string) => {
    setFilters && setFilters(set('entityId', value)(filters));
  };

  const formatLocation = (location: any): string => {
    if (!location) return '';
    if (location.definition?.type === 'groupId') {
      return location.value?.name || location.value || '';
    }
    if (location.definition?.type === 'portId') {
      return `${location.value?.city || ''} ${location.value?.id || ''}`.trim();
    }
    return location.value || '';
  };

  const filterOptions = [
    { id: 'unmatched', label: 'Unmatched' },
    ...(opportunities || []).map(opp => {
      const bookingParty = opp.bookingPartyId?.name || '';
      const placeOfReceipt = formatLocation(opp.placeOfReceipt);
      const portOfLoading = formatLocation(opp.portOfLoading);
      const portOfDischarge = formatLocation(opp.portOfDischarge);
      const placeOfDelivery = formatLocation(opp.placeOfDelivery);

      const label = `${opp.opportunityId} - ${bookingParty} - ${placeOfReceipt} - ${portOfLoading} - ${portOfDischarge} - ${placeOfDelivery}`;

      return {
        id: opp.id,
        label,
      };
    }),
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
        <Grid item sm={6} xs={12}>
          <TextField
            label="Entity ID"
            variant="outlined"
            fullWidth
            value={entityId || ''}
            onChange={e => setEntityIdFilter(e.target.value)}
            placeholder="Search by booking/quote ID..."
          />
        </Grid>
      </Grid>
    </Box>
  );
};

export default ManualMatchingFiltersBar;
