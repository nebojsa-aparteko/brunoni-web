import { Grid, makeStyles, Paper } from '@material-ui/core';
import React, { Fragment, useMemo, useState } from 'react';

import { useManualMatchingListFilterContext } from '../../providers/ManualMatchingFilterProvider';
import Meta from '../Meta';
import AddOpportunityDialog from './AddOpportunityDialogue';
import ManualMatchingEmptyResults from './ManualMatchingEmptyResults';
import ManualMatchingFiltersBar from './ManualMatchingFiltersBar';
import ManualMatchingTable, { SortConfig } from './ManualMatchingTable';
import MatchOpportunityDialog from './MatchOpportunityDialog';
import firebase from '../../firebase';
import useFirestoreCollection from '../../hooks/useFirestoreCollection';
import useNormalizedOpportunityMatch from '../../hooks/useNormalizedOpportunityMatch';
import useOpportunities from '../../hooks/useOpportunities';
import {
  EntityOpportunityMatch,
  NormalizedEntityOpportunityMatch,
  OpportunityMatchStatus,
} from '../../model/Opportunity';
import ChartsCircularProgress from '../dashboard/ChartsCircularProgress';

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
      // Filter by entity ID (booking/quote ID)
      if (filters.entityId && filters.entityId.trim()) {
        const entityIdMatch = match.entityId
          .toLowerCase()
          .startsWith(filters.entityId.toLowerCase().trim());
        if (!entityIdMatch) return false;
      }

      // Filter by booking party
      if (filters.bookingParty) {
        const bookingPartyMatch = match.bookingPartyId === filters.bookingParty.id;
        if (!bookingPartyMatch) return false;
      }

      // Filter by selected opportunity
      if (
        filters.opportunity &&
        filters.opportunity !== OpportunityMatchStatus.Unmatched &&
        filters.opportunity !== OpportunityMatchStatus.Discarded
      ) {
        return match.opportunityId === filters.opportunity;
      }

      // Show unmatched items (items without an opportunityId or with null/undefined opportunityId)
      if (filters.opportunity === OpportunityMatchStatus.Unmatched) {
        return match.status !== OpportunityMatchStatus.Discarded && !match.opportunityId;
      }

      if (filters.opportunity === OpportunityMatchStatus.Discarded) {
        return match.status === OpportunityMatchStatus.Discarded;
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

  const handleBulkDiscardMatches = async (matchIds: string[]) => {
    try {
      const batch = firebase.firestore().batch();
      const updateData = {
        opportunityId: null,
        status: OpportunityMatchStatus.Discarded,
        updatedAt: new Date(),
        updatedBy: firebase.auth().currentUser?.uid || 'unknown',
      };

      matchIds.forEach(matchId => {
        const matchRef = firebase.firestore().collection('opportunity-matches').doc(matchId);
        batch.update(matchRef, updateData);
      });

      await batch.commit();
    } catch (error) {
      console.error('Failed to discard matches:', error);
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
        opportunityId: null,
        status: OpportunityMatchStatus.Unmatched,
        updatedAt: new Date(),
        updatedBy: firebase.auth().currentUser?.uid || 'unknown',
      });
    } catch (error) {
      console.error('Failed to unmatch opportunity:', error);
    }
  };

  const handleAutoRematchOpportunity = (match: NormalizedEntityOpportunityMatch) => {
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
                  filters.opportunity === OpportunityMatchStatus.Unmatched
                    ? 'No unmatched entities found.'
                    : filters.opportunity === OpportunityMatchStatus.Discarded
                      ? 'No discarded entities found.'
                      : filters.opportunity
                        ? 'No matches found for the selected opportunity.'
                        : 'No manual matching entities found for your filter criteria. Try changing filters.'
                }
              />
            ) : (
              <ManualMatchingTable
                sortConfig={sortConfig}
                onSort={handleSort}
                opportunityMatches={filteredData}
                onMatchOpportunity={handleMatchOpportunity}
                onCreateNewOpportunity={handleCreateNewOpportunity}
                onBulkDiscardMatches={handleBulkDiscardMatches}
                onUnmatchOpportunity={handleUnmatchOpportunity}
                onAutoRematchOpportunity={handleAutoRematchOpportunity}
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
        currentMatch={selectedMatch || undefined}
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
