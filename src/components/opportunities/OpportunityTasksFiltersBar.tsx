import React from 'react';
import { Box, Grid, TextField } from '@material-ui/core';
import Autocomplete from '@material-ui/lab/Autocomplete';
import set from 'lodash/fp/set';
import UserRecord from '../../model/UserRecord';
import { OpportunityTasksFilters } from './OpportunityTasksView';

interface Props {
  filters: OpportunityTasksFilters;
  setFilters: (filters: OpportunityTasksFilters) => void;
  users: UserRecord[] | null;
}

const OpportunityTasksFiltersBar: React.FC<Props> = ({ filters, setFilters, users }) => {
  const { assignedUser, fileNumber } = filters;

  const setAssignedUserFilter = (user: UserRecord | null | undefined) =>
    setFilters && setFilters(set('assignedUser', user || undefined)(filters));

  const setFileNumberFilter = (fileNumber: string) =>
    setFilters && setFilters(set('fileNumber', fileNumber || '')(filters));

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
        <Grid item sm={6} xs={12}>
          <TextField
            label="Opportunity ID"
            variant="outlined"
            fullWidth
            value={fileNumber || ''}
            onChange={e => setFileNumberFilter(e.target.value)}
            placeholder="Search by Opportunity ID..."
          />
        </Grid>
        {users && (
          <Grid item sm={6} xs={12}>
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
      </Grid>
    </Box>
  );
};

export default OpportunityTasksFiltersBar;
