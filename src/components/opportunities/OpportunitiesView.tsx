import React, { Fragment, useMemo, useState } from 'react';
import { Grid, makeStyles, Paper, Button } from '@material-ui/core';
import Meta from '../Meta';
import OpportunitiesFiltersBar from './OpportunitiesFiltersBar';
import ChartsCircularProgress from '../dashboard/ChartsCircularProgress';
import { useOpportunitiesListFilterContext } from '../../providers/OpportunitiesFilterProvider';
import { useOpportunityListPaginationContext } from '../../providers/OpportunityListPaginationProvider';
import OpportunitiesEmptyResults from './OpportunitisEmptyResults';
import OpportunityTable, { SortConfig } from './OpportunityTable';
import { NormalizedOpportunity } from '../../model/Opportunity';
import useFirestoreCollection from '../../hooks/useFirestoreCollection';
import useNormalizedOpportunity from '../../hooks/useNormalizedOpportunity';
import AddOpportunityDialog from './AddOpportunityDialogue';
import EditOpportunityDialog from './EditOpportunityDialog';
import OpportunityUploadDialog from './OpportunityUploadDialog';

interface Props {
  isAdmin?: boolean;
  archived?: boolean;
  showDateRangeFilter?: boolean;
}

const useStyles = makeStyles(theme => ({
  root: {
    marginTop: theme.spacing(4),
    marginBottom: theme.spacing(4),
    padding: theme.spacing(5),
  },
}));

const OpportunitiesView: React.FC<Props> = ({ isAdmin }) => {
  const classes = useStyles();
  const isLoading = false; // Replace with actual loading state if needed
  const opportunitySnapshot = useFirestoreCollection('opportunities');
  const opportunityIds = useMemo(() => {
    return opportunitySnapshot?.docs?.map(doc => doc.id) || [];
  }, [opportunitySnapshot?.docs]);
  const normalizeOpportunity = useNormalizedOpportunity(opportunityIds);
  const opportunities: NormalizedOpportunity[] | undefined = useMemo(() => {
    return opportunitySnapshot?.docs?.map(doc =>
      normalizeOpportunity({ id: doc.id, ...doc.data() }),
    );
  }, [opportunitySnapshot?.docs, normalizeOpportunity]);
  const [filters, setFilters] = useOpportunitiesListFilterContext();
  const [opportunityPaginationContextData, setOpportnityPaginationContextData] =
    useOpportunityListPaginationContext();
  const { searchString, page, rowsPerPage } = opportunityPaginationContextData;

  const { assignee } = filters;

  const filteredOpportunities = useMemo(() => {
    if (!opportunities) return [];
    return opportunities.filter(opportunity => {
      if (filters.assignee && opportunity.salesRepId?.id !== filters.assignee.id) {
        return false;
      }
      if (
        filters.statisticalClient &&
        opportunity.statisticalClientId?.id !== filters.statisticalClient.id
      ) {
        return false;
      }
      if (filters.bookingParty && opportunity.bookingPartyId?.id !== filters.bookingParty.id) {
        return false;
      }

      if (
        filters.portsOfLoading &&
        opportunity.portOfLoading?.definition.value !== filters.portsOfLoading.definition.value
      ) {
        return false;
      }
      if (
        filters.portsOfDischarge &&
        opportunity.portOfDischarge?.definition.value !== filters.portsOfDischarge.definition.value
      ) {
        return false;
      }

      if (
        filters.placesOfDelivery &&
        opportunity.placeOfDelivery?.definition.value !== filters.placesOfDelivery.definition.value
      ) {
        return false;
      }
      if (
        filters.placesOfReceipt &&
        opportunity.placeOfReceipt?.definition.value !== filters.placesOfReceipt.definition.value
      ) {
        return false;
      }

      if (filters.tags && filters.tags.length > 0) {
        const oppTagIds = (opportunity.tagIds || []).map(tag => tag.id);
        const filterTagIds = filters.tags.map(tag => tag.id);
        if (!filterTagIds.some(id => oppTagIds.includes(id))) {
          return false;
        }
      }

      if (
        filters.commodity &&
        opportunity.commodity?.definition.value !== filters.commodity.definition.value
      ) {
        return false;
      }

      if (
        filters.equipment &&
        opportunity.equipment?.definition.value !== filters.equipment.definition.value
      ) {
        return false;
      }

      if (filters.quoteKind && opportunity.quoteKind !== filters.quoteKind) {
        return false;
      }

      if (filters.opportunityId && filters.opportunityId.trim() !== '') {
        const searchTerm = filters.opportunityId.toLowerCase().trim();
        const opportunityId = (opportunity.opportunityId || '').toLowerCase();
        if (!opportunityId.includes(searchTerm)) {
          return false;
        }
      }
      console.debug('filters', filters);
      return true;
    });
  }, [opportunities, filters]);

  const [openDialog, setOpenDialog] = useState(false);
  const [newOpportunityName, setNewOpportunityName] = useState('');

  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedOpportunity, setSelectedOpportunity] = useState<NormalizedOpportunity | null>(
    null,
  );

  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);

  // Sorting state
  const [sortConfig, setSortConfig] = useState<SortConfig>({ key: '', direction: 'asc' });

  const handleSort = (key: string) => {
    setSortConfig(prevConfig => ({
      key,
      direction: prevConfig.key === key && prevConfig.direction === 'asc' ? 'desc' : 'asc',
    }));
  };

  const handleUploadDialog = () => {
    setUploadDialogOpen(true);
  };
  const handleCloseUploadDialog = () => {
    setUploadDialogOpen(false);
  };

  const handleOpenDialog = () => setOpenDialog(true);
  const handleCloseDialog = () => setOpenDialog(false);

  const handleAddOpportunity = () => {
    setOpenDialog(false);
    setNewOpportunityName('');
  };

  const handleEditOpportunity = (opportunity: NormalizedOpportunity) => {
    setSelectedOpportunity(opportunity);
    setEditDialogOpen(true);
  };

  const handleCloseEditDialog = () => {
    setEditDialogOpen(false);
    setSelectedOpportunity(null);
  };

  const handleUpdateOpportunity = (updatedOpportunity: NormalizedOpportunity) => {
    // console.debug('Opportunity updated:', updatedOpportunity);
  };

  const handleDeleteOpportunity = (opportunityId: string) => {
    // console.debug('Opportunity deleted:', opportunityId);
  };

  return (
    <Fragment>
      <Meta title={`Opportunities`} />
      <Grid container direction="row">
        <Grid item sm={3} xs={12}>
          <Button
            variant="contained"
            color="primary"
            onClick={handleOpenDialog}
            style={{ marginRight: 8 }}
          >
            Add Opportunity
          </Button>
          <Button
            variant="contained"
            color="primary"
            onClick={handleUploadDialog}
            style={{ marginRight: 8 }}
          >
            Upload xlsx
          </Button>

          <AddOpportunityDialog
            open={openDialog}
            onClose={handleCloseDialog}
            onAdd={handleAddOpportunity}
          />
          <EditOpportunityDialog
            open={editDialogOpen}
            opportunity={selectedOpportunity}
            onClose={handleCloseEditDialog}
            onUpdate={handleUpdateOpportunity}
            onDelete={handleDeleteOpportunity}
          />
          <OpportunityUploadDialog
            isOpen={uploadDialogOpen}
            handleClose={handleCloseUploadDialog}
            onUploadComplete={() => {
              console.debug('Upload completed - data should refresh automatically');
            }}
          />
        </Grid>
        <Grid item md={12}>
          <OpportunitiesFiltersBar
            filters={filters}
            setFilters={setFilters}
            showAssigneeFilter={isAdmin}
          />
        </Grid>

        <Grid item md={12}></Grid>
      </Grid>
      <div>
        {!isLoading ? (
          <Fragment>
            {filteredOpportunities && filteredOpportunities.length === 0 ? (
              <OpportunitiesEmptyResults
                message={
                  assignee
                    ? 'There are no opportunities that might need your attention at the moment. ' +
                      'You can use filters bar or quick search (ctrl+g on keyboard) to find what you might be looking for.'
                    : 'No bookings found for your filter criteria. Try changing filters.'
                }
              />
            ) : (
              <OpportunityTable
                opportunities={filteredOpportunities}
                onRowClick={handleEditOpportunity}
                sortConfig={sortConfig}
                onSort={handleSort}
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

export default OpportunitiesView;
