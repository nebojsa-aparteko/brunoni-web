import React, { Fragment, useCallback, useMemo, useState } from 'react';
import {
  Box,
  Card,
  CardHeader,
  Divider,
  Grid,
  makeStyles,
  Paper,
  Button,
  Typography,
} from '@material-ui/core';
import { flow, set } from 'lodash/fp';
import Meta from '../Meta';
import OpportunitiesFiltersBar from './OpportunitiesFiltersBar';
import ChartsCircularProgress from '../dashboard/ChartsCircularProgress';
import { useOpportunitiesListFilterContext } from '../../providers/OpportunitiesFilterProvider';
import { useOpportunityListPaginationContext } from '../../providers/OpportunityListPaginationProvider';
import Search from '../searchbar/Search';
import OpportunitiesEmptyResults from './OpportunitisEmptyResults';
import OpportunityTable from './OpportunityTable';
import { NormalizedOpportunity } from '../../model/Opportunity';
import useFirestoreCollection from '../../hooks/useFirestoreCollection';
import useNormalizedOpportunity from '../../hooks/useNormalizedOpportunity';
import AddOpportunityDialog from './AddOpportunityDialogue';
import EditOpportunityDialog from './EditOpportunityDialog';
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

const OpportunitiesView: React.FC<Props> = ({ isAdmin, archived, showDateRangeFilter }) => {
  const classes = useStyles();
  const isLoading = false; // Replace with actual loading state if needed
  const opportunitySnapshot = useFirestoreCollection('opportunities');
  const normalizeOpportunity = useNormalizedOpportunity();
  const opportunities: NormalizedOpportunity[] | undefined = opportunitySnapshot?.docs?.map(doc =>
    normalizeOpportunity({ id: doc.id, ...doc.data() }),
  );

  console.debug('OpportunitiesView', opportunities);
  const [filters, setFilters] = useOpportunitiesListFilterContext();
  const [opportunityPaginationContextData, setOpportnityPaginationContextData] =
    useOpportunityListPaginationContext();
  const { searchString, page, rowsPerPage } = opportunityPaginationContextData;

  // Filter opportunities based on selected filters
  const { assignee } = filters;

  const filteredOpportunities = useMemo(() => {
    if (!opportunities) return [];
    return opportunities.filter(opportunity => {
      if (filters.assignee && opportunity.salesRepId?.id !== filters.assignee.id) {
        return false;
      }
      if (filters.clientFilter && opportunity.statisticalClientId?.id !== filters.clientFilter.id) {
        return false;
      }

      if (
        filters.portsOfLoadingGroup &&
        opportunity.portOfLoadingGroupId?.id !== filters.portsOfLoadingGroup.id
      ) {
        return false;
      }
      if (
        filters.portsOfDischargeGroup &&
        opportunity.portOfDischargeGroupId?.id !== filters.portsOfDischargeGroup.id
      ) {
        return false;
      }

      // Places group filter
      if (
        filters.placesOfDeliveryGroup &&
        opportunity.placeOfDeliveryGroupId?.id !== filters.placesOfDeliveryGroup.id
      ) {
        return false;
      }
      if (
        filters.placesOfReceiptGroup &&
        opportunity.placeOfReceiptGroupId?.id !== filters.placesOfReceiptGroup.id
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
        filters.commodityGroup &&
        opportunity.commodityGroupId?.id !== filters.commodityGroup.id
      ) {
        return false;
      }

      if (
        filters.equipmentGroup &&
        opportunity.equipmentGroupId?.id !== filters.equipmentGroup.id
      ) {
        return false;
      }

      return true;
    });
  }, [opportunities, filters]);

  const handleSearch = useCallback(
    (searchStringNew: string) => {
      if (searchStringNew !== searchString && setOpportnityPaginationContextData) {
        setOpportnityPaginationContextData(
          flow(
            set('searchString', searchStringNew),
            set('page', 0),
          )(opportunityPaginationContextData),
        );
      }
    },
    [opportunityPaginationContextData, searchString, setOpportnityPaginationContextData],
  );

  const [openDialog, setOpenDialog] = useState(false);
  const [newOpportunityName, setNewOpportunityName] = useState('');

  // Edit opportunity dialog state
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedOpportunity, setSelectedOpportunity] = useState<NormalizedOpportunity | null>(
    null,
  );

  const handleOpenDialog = () => setOpenDialog(true);
  const handleCloseDialog = () => setOpenDialog(false);

  const handleAddOpportunity = () => {
    setOpenDialog(false);
    setNewOpportunityName('');
  };

  // Edit opportunity handlers
  const handleEditOpportunity = (opportunity: NormalizedOpportunity) => {
    setSelectedOpportunity(opportunity);
    setEditDialogOpen(true);
  };

  const handleCloseEditDialog = () => {
    setEditDialogOpen(false);
    setSelectedOpportunity(null);
  };

  const handleUpdateOpportunity = (updatedOpportunity: NormalizedOpportunity) => {
    // The dialog handles the Firebase update, this callback is for any additional UI updates
    console.debug('Opportunity updated:', updatedOpportunity);
    // You might want to refresh the data or update local state here if needed
  };

  return (
    <Fragment>
      <Meta title={`Opportunities`} />
      <Grid container direction="row">
        <Grid item sm={3} xs={12}>
          <Button variant="contained" color="primary" onClick={handleOpenDialog}>
            Add Opportunity
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
            <Card>
              <CardHeader
                title={
                  <Box display="flex" alignItems="center">
                    <Typography variant="subtitle1" display="inline">
                      Opportunity {archived && '- Archive'}
                    </Typography>
                    <Divider orientation="vertical" style={{ height: '100%' }} />
                    <div id="exportImportBkgView"></div>

                    <Box flex={1} />

                    <Search
                      onSearch={handleSearch}
                      localStorageKey={'bookingSearchQuery'}
                      style={{
                        visibility: 'initial',
                      }}
                    />
                  </Box>
                }
              />
            </Card>

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
