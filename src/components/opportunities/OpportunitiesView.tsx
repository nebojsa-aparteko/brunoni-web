import { Button, Grid, makeStyles, Paper } from '@material-ui/core';
import React, { Fragment, useMemo, useState } from 'react';

import Meta from '../Meta';
import OpportunitiesFiltersBar from './OpportunitiesFiltersBar';
import ChartsCircularProgress from '../dashboard/ChartsCircularProgress';
import { useOpportunitiesListFilterContext } from '../../providers/OpportunitiesFilterProvider';
import OpportunitiesEmptyResults from './OpportunitisEmptyResults';
import OpportunityTable, { SortConfig } from './OpportunityTable';
import { NormalizedOpportunity, OpportunityMatchDefinition } from '../../model/Opportunity';
import AddOpportunityDialog from './AddOpportunityDialogue';
import EditOpportunityDialog from './EditOpportunityDialog';
import OpportunityUploadDialog from './OpportunityUploadDialog';
import Port from '../../model/Port';
import { OpportunityPortsGroup } from '../../model/OpportunityPortsGroup';
import { isEqual } from 'lodash';
import { OpportunityPlacesGroup } from '../../model/OpportunityPlacesGroup';
import { OpportunityCommodityGroup } from '../../model/OpportunityCommodityGroup';
import { OpportunityEquipmentGroup } from '../../model/OpportunityEquipmentGroup';
import ContainerType from '../../model/ContainerType';
import { useOpportunities } from './OpportunitiesDataProvider';

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
  const opportunities = useOpportunities();
  const isLoading = !opportunities;
  const [filters, setFilters] = useOpportunitiesListFilterContext();

  const { assignee } = filters;

  const isPortMatch = (
    filter: {
      definition: OpportunityMatchDefinition<'groupId' | 'portId' | 'freeText'>;
      value: OpportunityPortsGroup | Port | string;
    },
    opportunityPort: {
      definition: OpportunityMatchDefinition<'groupId' | 'portId' | 'freeText'>;
      value: OpportunityPortsGroup | Port | string;
    } | null,
  ) => {
    if (isEqual(filter.definition, opportunityPort?.definition)) {
      return true;
    }

    if (filter.definition.type === 'groupId' && opportunityPort?.definition.type === 'portId') {
      return (filter.value as OpportunityPortsGroup).portIds.includes(
        (opportunityPort.value as Port).id,
      );
    }

    if (filter.definition.type === 'portId' && opportunityPort?.definition.type === 'freeText') {
      const port = filter.value as Port;
      return (
        port.id === (opportunityPort.value as string) ||
        port.city === (opportunityPort.value as string)
      );
    }

    return false;
  };

  const isPlaceMatch = (
    filter: {
      definition: OpportunityMatchDefinition<'groupId' | 'freeText'>;
      value: OpportunityPlacesGroup | string;
    },
    opportunityPlace: {
      definition: OpportunityMatchDefinition<'groupId' | 'freeText'>;
      value: OpportunityPlacesGroup | string;
    } | null,
  ) => {
    if (isEqual(filter.definition, opportunityPlace?.definition)) {
      return true;
    }

    if (filter.definition.type === 'groupId' && opportunityPlace?.definition.type === 'freeText') {
      return (filter.value as OpportunityPlacesGroup).places.includes(
        opportunityPlace.value as string,
      );
    }

    return false;
  };

  const isCommodityMatch = (
    filter: {
      definition: OpportunityMatchDefinition<'groupId' | 'freeText'>;
      value: OpportunityCommodityGroup | string;
    },
    opportunityCommodity: {
      definition: OpportunityMatchDefinition<'groupId' | 'freeText'>;
      value: OpportunityCommodityGroup | string;
    } | null,
  ) => {
    if (isEqual(filter.definition, opportunityCommodity?.definition)) {
      return true;
    }

    if (
      filter.definition.type === 'groupId' &&
      opportunityCommodity?.definition.type === 'freeText'
    ) {
      return (filter.value as OpportunityCommodityGroup).commodities.includes(
        opportunityCommodity.value as string,
      );
    }

    return false;
  };

  const isEquipmentMatch = (
    filter: {
      definition: OpportunityMatchDefinition<'groupId' | 'containerTypeId'>;
      value: OpportunityEquipmentGroup | ContainerType;
    },
    opportunityEquipment: {
      definition: OpportunityMatchDefinition<'groupId' | 'containerTypeId'>;
      value: OpportunityEquipmentGroup | ContainerType;
    } | null,
  ) => {
    if (isEqual(filter.definition, opportunityEquipment?.definition)) {
      return true;
    }

    if (
      filter.definition.type === 'groupId' &&
      opportunityEquipment?.definition.type === 'containerTypeId'
    ) {
      return (filter.value as OpportunityEquipmentGroup).equipmentTypeId.includes(
        (opportunityEquipment.value as ContainerType).id,
      );
    }

    return false;
  };

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
        !isPortMatch(filters.portsOfLoading, opportunity.portOfLoading)
      ) {
        return false;
      }
      if (
        filters.portsOfDischarge &&
        !isPortMatch(filters.portsOfDischarge, opportunity.portOfDischarge)
      ) {
        return false;
      }

      if (
        filters.placesOfDelivery &&
        !isPlaceMatch(filters.placesOfDelivery, opportunity.placeOfDelivery)
      ) {
        return false;
      }
      if (
        filters.placesOfReceipt &&
        !isPlaceMatch(filters.placesOfReceipt, opportunity.placeOfReceipt)
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

      if (filters.commodity && !isCommodityMatch(filters.commodity, opportunity.commodity)) {
        return false;
      }

      if (filters.equipment && !isEquipmentMatch(filters.equipment, opportunity.equipment)) {
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
      return true;
    });
  }, [opportunities, filters]);

  const [openDialog, setOpenDialog] = useState(false);

  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedOpportunity, setSelectedOpportunity] = useState<NormalizedOpportunity | null>(
    null,
  );

  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);

  const [sortConfig, setSortConfig] = useState<SortConfig>({ key: 'id', direction: 'asc' });

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

          <AddOpportunityDialog open={openDialog} onClose={handleCloseDialog} />
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
                editOpportunity={handleEditOpportunity}
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
