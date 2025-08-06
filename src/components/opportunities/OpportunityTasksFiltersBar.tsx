import React from 'react';
import { Box, Grid, TextField, FormControlLabel, Checkbox } from '@material-ui/core';
import Autocomplete from '@material-ui/lab/Autocomplete';
import set from 'lodash/fp/set';
import UserRecord from '../../model/UserRecord';
import { NormalizedOpportunity, opportunityToString } from '../../model/Opportunity';
import { OpportunityTasksFilters } from './OpportunityTasksView';

interface Props {
  filters: OpportunityTasksFilters;
  setFilters: (filters: OpportunityTasksFilters) => void;
  users: UserRecord[] | null;
  opportunities: NormalizedOpportunity[] | null;
}

const OpportunityTasksFiltersBar: React.FC<Props> = ({
  filters,
  setFilters,
  users,
  opportunities,
}) => {
  const { assignedUser, opportunity, showResolved } = filters;

  const setAssignedUserFilter = (user: UserRecord | null | undefined) =>
    setFilters && setFilters(set('assignedUser', user || undefined)(filters));

  const setOpportunityFilter = (opportunity: NormalizedOpportunity | null) =>
    setFilters && setFilters(set('opportunity', opportunity)(filters));

  const setShowResolvedFilter = (showResolved: boolean) =>
    setFilters && setFilters(set('showResolved', showResolved)(filters));

  const opportunityFilterOptions = [
    { id: 'all', label: 'All Opportunities', data: null },
    ...(opportunities || []).map(opp => ({
      id: opp.id,
      label: opportunityToString(opp),
      data: opp,
    })),
  ];

  const selectedOpportunity = opportunity
    ? opportunityFilterOptions.find(option => option.id === opportunity.id)
    : opportunityFilterOptions[0];

  return (
    <Box
      display="flex"
      flexDirection="row"
      flexWrap="wrap"
      justifyContent="flex-start"
      alignItems="center"
      minWidth={400}
      maxWidth={960}
      my={2}
      mx={1}
    >
      <Grid container spacing={2}>
        <Grid item sm={4} xs={12}>
          <Autocomplete
            options={opportunityFilterOptions}
            getOptionLabel={option => option.label}
            value={selectedOpportunity || opportunityFilterOptions[0]}
            onChange={(_, value) => setOpportunityFilter(value?.data || null)}
            renderInput={params => (
              <TextField {...params} label="Opportunity" variant="outlined" fullWidth />
            )}
          />
        </Grid>
        {users && (
          <Grid item sm={4} xs={12}>
            <Autocomplete
              options={users || []}
              getOptionLabel={(option: UserRecord) =>
                option ? `${option.firstName || ''} ${option.lastName || ''}`.trim() : ''
              }
              getOptionSelected={(option: UserRecord, value: UserRecord) =>
                option?.id === value?.id
              }
              value={assignedUser || null}
              onChange={(_, user: UserRecord | null) => setAssignedUserFilter(user)}
              clearOnEscape
              disableClearable={false}
              renderInput={params => (
                <TextField {...params} label="Assigned To" variant="outlined" fullWidth />
              )}
            />
          </Grid>
        )}
        <Grid item sm={4} xs={12} style={{ display: 'flex', alignItems: 'center' }}>
          <FormControlLabel
            control={
              <Checkbox
                checked={showResolved}
                onChange={e => setShowResolvedFilter(e.target.checked)}
                color="primary"
              />
            }
            label="Show resolved tasks"
          />
        </Grid>
      </Grid>
    </Box>
  );
};

export default OpportunityTasksFiltersBar;
