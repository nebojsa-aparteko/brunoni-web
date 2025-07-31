import React, { Fragment, useMemo, useState } from 'react';
import { Grid, makeStyles, Paper } from '@material-ui/core';
import Meta from '../Meta';
import ManualMatchingFiltersBar from './ManualMatchingFiltersBar';
import ChartsCircularProgress from '../dashboard/ChartsCircularProgress';
import { useManualMatchingListFilterContext } from '../../providers/ManualMatchingFilterProvider';
import ManualMatchingTable, { SortConfig } from './ManualMatchingTable';
import ManualMatchingEmptyResults from './ManualMatchingEmptyResults';
import useFirestoreCollection from '../../hooks/useFirestoreCollection';
import useNormalizedOpportunityMatch from '../../hooks/useNormalizedOpportunityMatch';
import { EntityOpportunityMatch } from '../../model/Opportunity';

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
  const [filters, setFilters] = useManualMatchingListFilterContext();

  // Fetch opportunity matches from Firestore
  const opportunityMatchSnapshot = useFirestoreCollection('opportunity-matches');
  if (opportunityMatchSnapshot?.empty && opportunityMatchSnapshot?.size === 0) {
    console.log('opportunity-matches collection is empty or inaccessible');
  }
  // Convert snapshot to EntityOpportunityMatch array
  const entityOpportunityMatches = useMemo(() => {
    if (!opportunityMatchSnapshot) return [];
    if (!opportunityMatchSnapshot.docs) return [];
    return opportunityMatchSnapshot.docs.map(doc => doc.data() as EntityOpportunityMatch);
  }, [opportunityMatchSnapshot]);

  // Get the normalization function
  const normalizeOpportunityMatch = useNormalizedOpportunityMatch();

  // Normalize the opportunity matches
  const normalizedMatches = useMemo(() => {
    if (!entityOpportunityMatches || !normalizeOpportunityMatch) return [];
    return entityOpportunityMatches.map(match => normalizeOpportunityMatch(match));
  }, [entityOpportunityMatches, normalizeOpportunityMatch]);

  const filteredData = useMemo(() => {
    if (!normalizedMatches) return [];

    return normalizedMatches.filter(match => {
      // Filter by selected opportunity
      if (filters.opportunity && filters.opportunity !== 'unmatched') {
        return match.opportunityId === filters.opportunity;
      }

      // Show unmatched items (items without an opportunityId or with null/undefined opportunityId)
      if (filters.opportunity === 'unmatched') {
        return !match.opportunityId;
      }

      // Default: show all matches if no specific filter is applied
      return true;
    });
  }, [normalizedMatches, filters]);

  const isLoading = !opportunityMatchSnapshot || !normalizeOpportunityMatch;

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
          <Fragment>
            {filteredData && filteredData.length === 0 ? (
              <ManualMatchingEmptyResults
                message={
                  filters.opportunity === 'unmatched'
                    ? 'No unmatched opportunities found.'
                    : filters.opportunity
                      ? 'No matches found for the selected opportunity.'
                      : 'No manual matching opportunities found for your filter criteria. Try changing filters.'
                }
              />
            ) : (
              <ManualMatchingTable
                sortConfig={sortConfig}
                onSort={handleSort}
                opportunityMatches={filteredData}
              />
            )}
          </Fragment>
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
