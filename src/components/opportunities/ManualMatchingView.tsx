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
import {
  EntityOpportunityMatch,
  NormalizedEntityOpportunityMatch,
  OpportunityMatchStatus,
  NormalizedOpportunity,
} from '../../model/Opportunity';
import MatchOpportunityDialog from './MatchOpportunityDialog';
import AddOpportunityDialog from './AddOpportunityDialogue';
import useOpportunities from '../../hooks/useOpportunities';
import firebase from '../../firebase';

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
      // First, exclude discarded matches
      if (match.status === OpportunityMatchStatus.Discarded) {
        return false;
      }

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

  // Dialog states
  const [matchDialogOpen, setMatchDialogOpen] = useState(false);
  const [addOpportunityDialogOpen, setAddOpportunityDialogOpen] = useState(false);
  const [selectedMatch, setSelectedMatch] = useState<NormalizedEntityOpportunityMatch | null>(null);

  // Get opportunities for matching
  const opportunities = useOpportunities();

  const handleMatchOpportunity = (match: NormalizedEntityOpportunityMatch) => {
    setSelectedMatch(match);
    setMatchDialogOpen(true);
  };

  const handleCreateNewOpportunity = (match: NormalizedEntityOpportunityMatch) => {
    setSelectedMatch(match);
    setAddOpportunityDialogOpen(true);
  };

  const handleDiscardMatch = async (match: NormalizedEntityOpportunityMatch) => {
    try {
      const matchRef = firebase
        .firestore()
        .collection('opportunity-matches')
        .doc(`${match.entity}-${match.entityId}`);
      await matchRef.update({
        status: OpportunityMatchStatus.Discarded,
        updatedAt: new Date(),
        updatedBy: firebase.auth().currentUser?.uid || 'unknown',
      });
      console.log('Match discarded successfully');
    } catch (error) {
      console.error('Failed to discard match:', error);
    }
  };

  const handleOpportunityMatch = async (opportunityId: string) => {
    if (!selectedMatch) return;

    try {
      const matchRef = firebase
        .firestore()
        .collection('opportunity-matches')
        .doc(`${selectedMatch.entity}-${selectedMatch.entityId}`);
      await matchRef.update({
        opportunityId,
        status: OpportunityMatchStatus.Matched,
        updatedAt: new Date(),
        updatedBy: firebase.auth().currentUser?.uid || 'unknown',
      });
      console.log('Match updated with opportunity:', opportunityId);
      setMatchDialogOpen(false);
      setSelectedMatch(null);
    } catch (error) {
      console.error('Failed to match opportunity:', error);
    }
  };

  const handleAddOpportunity = async (opportunityData: any) => {
    if (!selectedMatch) return;

    try {
      // Create the opportunity
      const opportunityRef = await firebase
        .firestore()
        .collection('opportunities')
        .add(opportunityData);

      // Update the match with the new opportunity ID
      const matchRef = firebase
        .firestore()
        .collection('opportunity-matches')
        .doc(`${selectedMatch.entity}-${selectedMatch.entityId}`);
      await matchRef.update({
        opportunityId: opportunityRef.id,
        status: OpportunityMatchStatus.Matched,
        updatedAt: new Date(),
        updatedBy: firebase.auth().currentUser?.uid || 'unknown',
      });

      console.log('New opportunity created and matched:', opportunityRef.id);
      setAddOpportunityDialogOpen(false);
      setSelectedMatch(null);
    } catch (error) {
      console.error('Failed to create opportunity:', error);
    }
  };

  const handleUnmatchOpportunity = async (match: NormalizedEntityOpportunityMatch) => {
    try {
      const matchRef = firebase
        .firestore()
        .collection('opportunity-matches')
        .doc(`${match.entity}-${match.entityId}`);
      await matchRef.update({
        opportunityId: firebase.firestore.FieldValue.delete(),
        status: OpportunityMatchStatus.Unmatched,
        updatedAt: new Date(),
        updatedBy: firebase.auth().currentUser?.uid || 'unknown',
      });
      console.log('Match unmatched successfully');
    } catch (error) {
      console.error('Failed to unmatch opportunity:', error);
    }
  };

  const handleRematchOpportunity = (match: NormalizedEntityOpportunityMatch) => {
    setSelectedMatch(match);
    setMatchDialogOpen(true);
  };

  const handleRowClick = (match: NormalizedEntityOpportunityMatch) => {
    const entityId = match.entityId;

    if (match.entity === 'booking') {
      // Open booking in new tab
      window.open(`/bookings/${entityId}`, '_blank');
    } else if (match.entity === 'quote') {
      // Open quote in new tab
      window.open(`/quotes/${entityId}`, '_blank');
    }
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
                opportunityMatches={filteredData}
                onMatchOpportunity={handleMatchOpportunity}
                onCreateNewOpportunity={handleCreateNewOpportunity}
                onDiscardMatch={handleDiscardMatch}
                onUnmatchOpportunity={handleUnmatchOpportunity}
                onRematchOpportunity={handleRematchOpportunity}
                onRowClick={handleRowClick}
              />
            )}
          </Fragment>
        ) : (
          <Paper className={classes.root}>
            <ChartsCircularProgress />
          </Paper>
        )}
      </div>

      {/* Match Opportunity Dialog */}
      <MatchOpportunityDialog
        open={matchDialogOpen}
        onClose={() => {
          setMatchDialogOpen(false);
          setSelectedMatch(null);
        }}
        onMatch={handleOpportunityMatch}
        opportunities={opportunities || []}
      />

      {/* Add Opportunity Dialog */}
      <AddOpportunityDialog
        open={addOpportunityDialogOpen}
        onClose={() => {
          setAddOpportunityDialogOpen(false);
          setSelectedMatch(null);
        }}
        onAdd={handleAddOpportunity}
        prefillFromMatch={selectedMatch || undefined}
      />
    </Fragment>
  );
};

export default ManualMatchingView;
