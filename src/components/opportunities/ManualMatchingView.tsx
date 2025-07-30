import React, { Fragment, useMemo, useState } from 'react';
import { Grid, makeStyles, Paper } from '@material-ui/core';
import Meta from '../Meta';
import ManualMatchingFiltersBar from './ManualMatchingFiltersBar';
import ChartsCircularProgress from '../dashboard/ChartsCircularProgress';
import { useManualMatchingListFilterContext } from '../../providers/ManualMatchingFilterProvider';
import ManualMatchingTable, { SortConfig } from './ManualMatchingTable';

interface Props {
  isAdmin?: boolean;
}

const useStyles = makeStyles(theme => ({
  root: {
    marginTop: theme.spacing(4),
    marginBottom: theme.spacing(4),
    padding: theme.spacing(5),
  },
}));

const ManualMatchingView: React.FC<Props> = ({ isAdmin }) => {
  const classes = useStyles();
  const isLoading = false; // Replace with actual loading state when implementing data fetching
  const [filters, setFilters] = useManualMatchingListFilterContext();

  // TODO: Implement data fetching for EntityOpportunityMatch
  // const entityOpportunityMatches = useFirestoreCollection('opportunity-matches');

  const filteredData = useMemo(() => {
    // TODO: Implement filtering logic based on selected opportunity
    // For now, return empty array
    return [];
  }, [filters]);

  // Sorting state
  const [sortConfig, setSortConfig] = useState<SortConfig>({ key: '', direction: 'asc' });

  const handleSort = (key: string) => {
    setSortConfig(prevConfig => ({
      key,
      direction: prevConfig.key === key && prevConfig.direction === 'asc' ? 'desc' : 'asc',
    }));
  };

  return (
    <Fragment>
      <Meta title="Manual Matching" />
      <Grid container direction="row">
        <Grid item md={12}>
          <ManualMatchingFiltersBar filters={filters} setFilters={setFilters} />
        </Grid>
        <Grid item md={12}></Grid>
      </Grid>
      <div>
        {!isLoading ? (
          <ManualMatchingTable sortConfig={sortConfig} onSort={handleSort} />
        ) : (
          <Paper className={classes.root}>
            <ChartsCircularProgress />
          </Paper>
        )}
      </div>
    </Fragment>
  );
};

export default ManualMatchingView;
